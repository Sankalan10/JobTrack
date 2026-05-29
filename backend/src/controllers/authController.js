import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { seedDemoData, seedAdditionalCandidates } from '../utils/seeder.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jobtrack_jwt_super_secret_key_987654321';

export const register = async (req, res) => {
  const { email, password, name, role, company } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields (email, password, name) are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRole = role === 'RECRUITER' ? 'RECRUITER' : 'STUDENT';
    let representedCompany = null;
    if (userRole === 'RECRUITER') {
      if (!company) {
        return res.status(400).json({ error: 'Recruiters must specify which company they represent' });
      }
      const companyArray = company
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0)
        .map(c => c.charAt(0).toUpperCase() + c.slice(1));
      
      if (companyArray.length === 0) {
        return res.status(400).json({ error: 'Recruiters must specify which company they represent' });
      }

      if (companyArray.length > 5) {
        return res.status(400).json({ error: 'You can represent up to 5 companies maximum' });
      }

      representedCompany = companyArray.join(', ');
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        name: name.trim(),
        role: userRole,
        company: representedCompany
      },
    });

    // Seed student demo jobs if registering the main demo account
    if (userRole === 'STUDENT' && normalizedEmail === 'demo@jobtrack.com') {
      await seedDemoData(user.id);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, company: user.company },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, company: user.company },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Database-less mock login bypass for Vercel!
    if (
      (normalizedEmail === 'demo@jobtrack.com' && password === 'password') ||
      (normalizedEmail === 'recruiter@jobtrack.com' && password === 'password')
    ) {
      const isRecruiter = normalizedEmail === 'recruiter@jobtrack.com';
      const mockUser = isRecruiter
        ? { 
            id: 'demo-recruiter-id', 
            email: 'recruiter@jobtrack.com', 
            name: 'Demo Recruiter (5-Company)', 
            role: 'RECRUITER', 
            company: 'Google, Swiggy, Stripe, CRED, Zomato' 
          }
        : { 
            id: 'demo-student-id', 
            email: 'demo@jobtrack.com', 
            name: 'Demo Student', 
            role: 'STUDENT' 
          };

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role, company: mockUser.company || null },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({ token, user: mockUser });
    }

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    // Auto-create and seed student demo account on login if it doesn't exist
    if (normalizedEmail === 'demo@jobtrack.com') {
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            password: passwordHash,
            name: 'Demo Student',
            role: 'STUDENT'
          },
        });
      }
      await seedDemoData(user.id);
    }

    // Auto-create and seed a recruiter demo account on login to make testing effortless!
    if (!user && normalizedEmail === 'recruiter@jobtrack.com') {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: passwordHash,
          name: 'Demo Recruiter (5-Company)',
          role: 'RECRUITER',
          company: 'Google, Swiggy, Stripe, CRED, Zomato'
        },
      });
      
      // Seed student demo users so the recruiter dashboard has multiple candidates immediately!
      let studentDemo = await prisma.user.findUnique({ where: { email: 'demo@jobtrack.com' } });
      if (!studentDemo) {
        studentDemo = await prisma.user.create({
          data: {
            email: 'demo@jobtrack.com',
            password: passwordHash,
            name: 'Demo Student',
            role: 'STUDENT'
          },
        });
      }
      await seedDemoData(studentDemo.id);
      
      // Seed additional candidates!
      await seedAdditionalCandidates(passwordHash);
    }

    // Auto-upgrade and seed extra candidates for existing recruiter demo account on login
    if (user && normalizedEmail === 'recruiter@jobtrack.com') {
      if (!user.company || !user.company.includes('Stripe')) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: 'Demo Recruiter (5-Company)',
            company: 'Google, Swiggy, Stripe, CRED, Zomato'
          }
        });
      }
      
      // Always ensure demo student is seeded
      let studentDemo = await prisma.user.findUnique({ where: { email: 'demo@jobtrack.com' } });
      if (studentDemo) {
        await seedDemoData(studentDemo.id);
      }

      // Seed additional candidates using recruiter's hashed password
      await seedAdditionalCandidates(user.password);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, company: user.company },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, company: user.company },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const getResume = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        resumeUploaded: true,
        resumeData: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to retrieve CV resume details' });
  }
};

export const updateResume = async (req, res) => {
  const { resumeData, resumeUploaded } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        resumeUploaded: resumeUploaded !== undefined ? resumeUploaded : true,
        resumeData: resumeData ? (typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData)) : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        resumeUploaded: true,
        resumeData: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Failed to save CV resume details' });
  }
};
