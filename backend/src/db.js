import { PrismaClient } from '@prisma/client';

const dbStore = {
  users: [
    {
      id: 'demo-student-id',
      email: 'demo@jobtrack.com',
      password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456', // mock bcrypt hash
      name: 'Demo Student',
      role: 'STUDENT',
      company: null,
      resumeUploaded: true,
      resumeData: JSON.stringify({
        summary: "High-performing Computer Science student with strong foundations in full-stack web development, data structures, and algorithms. Passionate about building responsive, accessible web applications and optimizing system performance.",
        education: [
          {
            school: "Indian Institute of Technology (IIT), Kharagpur",
            degree: "B.Tech in Computer Science and Engineering",
            year: "2022 - 2026",
            gpa: "9.2/10 CGPA"
          }
        ],
        experience: [
          {
            company: "JobTrack Corp",
            role: "Full Stack Development Intern",
            duration: "Summer 2025",
            highlights: [
              "Architected an interactive glassmorphic job application pipeline dashboard using React 18, Framer Motion, and Tailwind CSS, reducing state latency by 20%.",
              "Engineered secure, role-based backend controllers with Node.js, Express, and SQLite via Prisma ORM.",
              "Integrated interactive data charts using Recharts to visualize job status statistics and CTC take-home tax calculations."
            ]
          }
        ],
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "Python", "SQL", "SQLite", "Prisma", "Tailwind CSS", "Data Structures", "Algorithms"],
        projects: [
          {
            name: "JobTrack Funnel Suite",
            desc: "A premium job application funnel with ATS matching metrics, Indian CTC salary calculators, and interactive monthly calendars.",
            tech: ["React", "Express", "Prisma", "SQLite", "Tailwind CSS"]
          }
        ]
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo-recruiter-id',
      email: 'recruiter@jobtrack.com',
      password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
      name: 'Demo Recruiter (5-Company)',
      role: 'RECRUITER',
      company: 'Google, Swiggy, Stripe, CRED, Zomato',
      resumeUploaded: false,
      resumeData: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'student2-id',
      email: 'student2@jobtrack.com',
      password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
      name: 'Priyanjali Sen',
      role: 'STUDENT',
      company: null,
      resumeUploaded: true,
      resumeData: JSON.stringify({
        summary: "Detail-oriented Software Engineering student specialized in Data Science, statistical analysis, and machine learning models. Adept at transforming raw dataset parameters into actionable business insights.",
        education: [{ school: "Delhi Technological University (DTU)", degree: "B.Tech in Software Engineering", year: "2022 - 2026", gpa: "8.9/10 CGPA" }],
        experience: [{ company: "AnalyticsOne Lab", role: "Data Science Intern", duration: "Winter 2024", highlights: ["Designed and validated A/B testing..."] }],
        skills: ["python", "statistics", "a/b testing", "sql optimization"],
        projects: [{ name: "Ad Campaign Analytics Suite", desc: "A data analysis tool...", tech: ["Python", "Pandas"] }]
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'student3-id',
      email: 'student3@jobtrack.com',
      password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
      name: 'Rohan Malhotra',
      role: 'STUDENT',
      company: null,
      resumeUploaded: true,
      resumeData: JSON.stringify({
        summary: "Creative Software Engineer and Product Lead focused on mobile architectures and Swift/SwiftUI mobile suites.",
        education: [{ school: "Bits Pilani", degree: "B.E. in Computer Science", year: "2022 - 2026", gpa: "8.7/10 CGPA" }],
        experience: [{ company: "FintechMobile Co", role: "iOS Development Intern", duration: "Spring 2025" }],
        skills: ["swift", "swiftui", "ios sdk", "agile"],
        projects: [{ name: "WalletApp Swift UI", desc: "A fully functional mobile...", tech: ["Swift", "SwiftUI"] }]
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  jobs: []
};

// Seed initial mock jobs for Student Demo
const populateSeeds = () => {
  const today = new Date();
  const formatDate = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  dbStore.jobs = [
    {
      id: 'mock-job-1',
      company: 'Google',
      role: 'Software Engineer Intern',
      appliedDate: formatDate(-5),
      status: 'INTERVIEWING',
      salary: '₹85,000/month',
      interviewDate: formatDate(3),
      notes: 'Technical coding rounds scheduled. Focused on graph algorithms, dynamic programming, and systems scaling.',
      checklist: JSON.stringify([
        { id: '1', text: 'Research Google core principles', done: true },
        { id: '2', text: 'Study search algorithms (BFS/DFS)', done: true },
        { id: '3', text: 'Practice mock behavioral rounds', done: false }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: JSON.stringify({
        jdText: 'Looking for a Software Engineer Intern with strong data structures and algorithms, React, and Python skills.',
        resumeText: 'Software engineer with solid knowledge of data structures, algorithms, and React development.',
        matchScore: 66,
        matchedSkills: ['react', 'data structures', 'algorithms'],
        missingSkills: ['python']
      }),
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'demo-student-id',
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-job-2',
      company: 'Microsoft',
      role: 'Full Stack Engineer',
      appliedDate: formatDate(-8),
      status: 'APPLIED',
      salary: '₹18,00,000',
      interviewDate: null,
      notes: 'Applied via referral. Awaiting initial recruiter call.',
      checklist: JSON.stringify([
        { id: '1', text: 'Tailor resume keywords', done: true },
        { id: '2', text: 'Review REST API design patterns', done: false }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'demo-student-id',
      createdAt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-job-3',
      company: 'Stripe',
      role: 'Frontend Developer',
      appliedDate: formatDate(-15),
      status: 'OFFERED',
      salary: '₹24,50,000',
      interviewDate: null,
      notes: 'Offer received! Base Package: ₹20,00,000 LPA, Performance: ₹2,00,000 LPA, Sign-on: ₹2,50,000.',
      checklist: JSON.stringify([
        { id: '1', text: 'Technical frontend assessment', done: true },
        { id: '2', text: 'Review modern CSS and browser engines', done: true },
        { id: '3', text: 'Negotiate salary benchmarks', done: false }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', action: 'Moved to "Offer Received 🎉"', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'demo-student-id',
      createdAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-job-4',
      company: 'Uber',
      role: 'Backend Engineer',
      appliedDate: formatDate(-12),
      status: 'REJECTED',
      salary: '₹75,000/month',
      interviewDate: null,
      notes: 'Finished final interview rounds. Rejected due to headcount allocation updates.',
      checklist: JSON.stringify([
        { id: '1', text: 'System design layout assessment', done: true },
        { id: '2', text: 'Review thread safety and databases', done: true }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', action: 'Moved to "Rejected"', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'demo-student-id',
      createdAt: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-job-5',
      company: 'Zomato',
      role: 'Software Engineer I',
      appliedDate: formatDate(-3),
      status: 'APPLIED',
      salary: '₹15,00,000',
      interviewDate: null,
      notes: 'Applied through Zomato Careers portal. Focused on high-performance API structures.',
      checklist: JSON.stringify([
        { id: '1', text: 'Align resume with Node.js and SQL skills', done: true }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'demo-student-id',
      createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-job-6',
      company: 'Swiggy',
      role: 'Frontend Engineer',
      appliedDate: formatDate(-6),
      status: 'INTERVIEWING',
      salary: '₹16,50,000',
      interviewDate: formatDate(5),
      notes: 'Hiring Manager interview scheduled. Will focus on React optimization and micro-frontends.',
      checklist: JSON.stringify([
        { id: '1', text: 'Review Webpack & Vite bundles', done: true },
        { id: '2', text: 'Practice custom React hooks', done: false }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'demo-student-id',
      createdAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-job-7',
      company: 'CRED',
      role: 'Backend Developer',
      appliedDate: formatDate(-20),
      status: 'OFFERED',
      salary: '₹32,00,000',
      interviewDate: null,
      notes: 'Outstanding offer package! Base: ₹26LPA, Performance: ₹3LPA, CRED Stock Options: ₹3L.',
      checklist: JSON.stringify([
        { id: '1', text: 'Backend architect interview', done: true },
        { id: '2', text: 'Database index scaling round', done: true },
        { id: '3', text: 'Confirm benefits metrics', done: true }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 17 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', action: 'Moved to "Offer Received 🎉"', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'demo-student-id',
      createdAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Recruiter Dashboard seeded applicants
    {
      id: 'mock-rec-job-1',
      company: 'Google',
      role: 'Data Scientist Intern',
      appliedDate: formatDate(-6),
      status: 'INTERVIEWING',
      salary: '₹95,000/month',
      interviewDate: formatDate(2),
      notes: 'Preparing stats cases...',
      checklist: '[]',
      activityLog: '[]',
      resumeMatcherData: JSON.stringify({
        matchScore: 85,
        matchedSkills: ['python', 'statistics', 'a/b testing'],
        missingSkills: ['sql optimization']
      }),
      salaryCalculatorData: '{}',
      recruiterFeedback: JSON.stringify({
        ratings: { dsa: 4, systemDesign: 3.5, communication: 4.5 },
        notesLog: [
          { id: 'note-1', author: 'Demo Recruiter (5-Company)', company: 'Google', text: 'Excellent theoretical knowledge in multivariate regressions and predictive tree metrics. Moving to next tech evaluation.', date: '3 days ago', timestamp: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ]
      }),
      userId: 'student2-id',
      createdAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-rec-job-2',
      company: 'Swiggy',
      role: 'Frontend Developer',
      appliedDate: formatDate(-4),
      status: 'INTERVIEWING',
      salary: '₹16,50,000',
      interviewDate: formatDate(4),
      notes: 'Focusing on CSS custom layouts and atomic design schemas.',
      checklist: '[]',
      activityLog: '[]',
      resumeMatcherData: JSON.stringify({
        matchScore: 78,
        matchedSkills: ['react', 'tailwind css'],
        missingSkills: ['typescript']
      }),
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'student2-id',
      createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-rec-job-3',
      company: 'CRED',
      role: 'iOS Engineer',
      appliedDate: formatDate(-5),
      status: 'INTERVIEWING',
      salary: '₹28,50,000',
      interviewDate: formatDate(4),
      notes: 'Clearing Swift test...',
      checklist: '[]',
      activityLog: '[]',
      resumeMatcherData: JSON.stringify({
        matchScore: 82,
        matchedSkills: ['swift', 'swiftui', 'ios sdk'],
        missingSkills: ['objective-c']
      }),
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'student3-id',
      createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mock-rec-job-4',
      company: 'Stripe',
      role: 'Security Engineer',
      appliedDate: formatDate(-2),
      status: 'APPLIED',
      salary: '₹25,00,000',
      interviewDate: null,
      notes: 'Awaiting initial round schedule.',
      checklist: '[]',
      activityLog: '[]',
      resumeMatcherData: '{}',
      salaryCalculatorData: '{}',
      recruiterFeedback: '{}',
      userId: 'student3-id',
      createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

populateSeeds();

// Mock Prisma Client
const mockPrisma = {
  user: {
    findUnique: async (args) => {
      const { where } = args;
      let u;
      if (where.email) {
        const norm = where.email.toLowerCase().trim();
        u = dbStore.users.find(x => x.email.toLowerCase().trim() === norm);
      } else if (where.id) {
        u = dbStore.users.find(x => x.id === where.id);
      }
      return u ? { ...u } : null;
    },
    findFirst: async (args) => {
      const { where } = args;
      let u;
      if (where.email) {
        const norm = where.email.toLowerCase().trim();
        u = dbStore.users.find(x => x.email.toLowerCase().trim() === norm);
      } else if (where.id) {
        u = dbStore.users.find(x => x.id === where.id);
      }
      return u ? { ...u } : null;
    },
    create: async (args) => {
      const { data } = args;
      const newUser = {
        id: data.id || `user-${Date.now()}`,
        email: data.email.toLowerCase().trim(),
        password: data.password || '',
        name: data.name || '',
        role: data.role || 'STUDENT',
        company: data.company || null,
        resumeUploaded: data.resumeUploaded !== undefined ? data.resumeUploaded : true,
        resumeData: data.resumeData || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbStore.users.push(newUser);
      return { ...newUser };
    },
    update: async (args) => {
      const { where, data } = args;
      const idx = dbStore.users.findIndex(x => x.id === where.id);
      if (idx === -1) {
        // Safe check for email as well
        const emailIdx = dbStore.users.findIndex(x => x.email === where.email);
        if (emailIdx !== -1) {
          const u = dbStore.users[emailIdx];
          for (const key in data) {
            if (data[key] !== undefined) u[key] = data[key];
          }
          u.updatedAt = new Date().toISOString();
          return { ...u };
        }
        throw new Error('User not found');
      }
      const u = dbStore.users[idx];
      for (const key in data) {
        if (data[key] !== undefined) u[key] = data[key];
      }
      u.updatedAt = new Date().toISOString();
      return { ...u };
    }
  },
  job: {
    findMany: async (args = {}) => {
      let filtered = [...dbStore.jobs];
      if (args.where) {
        const { userId, company } = args.where;
        if (userId) {
          filtered = filtered.filter(x => x.userId === userId);
        }
        if (company) {
          if (company.equals) {
            filtered = filtered.filter(x => x.company.toLowerCase().trim() === company.equals.toLowerCase().trim());
          } else if (typeof company === 'string') {
            filtered = filtered.filter(x => x.company.toLowerCase().trim() === company.toLowerCase().trim());
          }
        }
      }
      
      // Populate nested user relation if requested in 'include'
      if (args.include && args.include.user) {
        filtered = filtered.map(j => {
          const u = dbStore.users.find(x => x.id === j.userId);
          return {
            ...j,
            user: u ? {
              name: u.name,
              email: u.email,
              resumeUploaded: u.resumeUploaded,
              resumeData: u.resumeData
            } : null
          };
        });
      }
      
      // Order by
      if (args.orderBy) {
        if (args.orderBy.createdAt === 'desc') {
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      }
      return filtered;
    },
    findUnique: async (args) => {
      const { where } = args;
      const j = dbStore.jobs.find(x => x.id === where.id);
      return j ? { ...j } : null;
    },
    findFirst: async (args) => {
      const { where } = args;
      let filtered = [...dbStore.jobs];
      if (where.userId) filtered = filtered.filter(x => x.userId === where.userId);
      if (where.company) {
        if (where.company.equals) {
          filtered = filtered.filter(x => x.company.toLowerCase().trim() === where.company.equals.toLowerCase().trim());
        } else if (typeof where.company === 'string') {
          filtered = filtered.filter(x => x.company.toLowerCase().trim() === where.company.toLowerCase().trim());
        }
      }
      return filtered[0] || null;
    },
    create: async (args) => {
      const { data } = args;
      const newJob = {
        id: data.id || `job-${Date.now()}`,
        company: data.company,
        role: data.role,
        descriptionUrl: data.descriptionUrl || null,
        salary: data.salary || null,
        appliedDate: data.appliedDate,
        status: data.status,
        interviewDate: data.interviewDate || null,
        notes: data.notes || '',
        checklist: data.checklist || '[]',
        activityLog: data.activityLog || '[]',
        resumeMatcherData: data.resumeMatcherData || '{}',
        salaryCalculatorData: data.salaryCalculatorData || '{}',
        recruiterFeedback: data.recruiterFeedback || '{}',
        userId: data.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbStore.jobs.push(newJob);
      return { ...newJob };
    },
    update: async (args) => {
      const { where, data } = args;
      const idx = dbStore.jobs.findIndex(x => x.id === where.id);
      if (idx === -1) throw new Error('Job not found');
      const j = dbStore.jobs[idx];
      for (const k in data) {
        if (data[k] !== undefined) {
          j[k] = data[k];
        }
      }
      j.updatedAt = new Date().toISOString();
      return { ...j };
    },
    delete: async (args) => {
      const { where } = args;
      const idx = dbStore.jobs.findIndex(x => x.id === where.id);
      if (idx === -1) throw new Error('Job not found');
      const deleted = dbStore.jobs.splice(idx, 1)[0];
      return deleted;
    },
    deleteMany: async (args = {}) => {
      const { where } = args;
      if (where && where.userId) {
        const countBefore = dbStore.jobs.length;
        dbStore.jobs = dbStore.jobs.filter(x => x.userId !== where.userId);
        return { count: countBefore - dbStore.jobs.length };
      }
      return { count: 0 };
    }
  }
};

let prisma;
try {
  // Safe dynamic initialization
  prisma = new PrismaClient();
  console.log('✅ Initialized PrismaClient instance.');
} catch (e) {
  console.log('⚠️ Failed to initialize PrismaClient. Falling back to in-memory store.');
  prisma = mockPrisma;
}

// Intercept queries on Vercel or DB failure
const safePrisma = new Proxy(prisma, {
  get(target, prop) {
    if (prop === 'user') {
      return new Proxy(target.user || mockPrisma.user, {
        get(userTarget, userProp) {
          return async (...args) => {
            try {
              if (typeof userTarget[userProp] !== 'function') return undefined;
              return await userTarget[userProp](...args);
            } catch (err) {
              console.warn(`Prisma user.${userProp} failed, routing through Mock Store:`, err.message);
              return await mockPrisma.user[userProp](...args);
            }
          };
        }
      });
    }
    if (prop === 'job') {
      return new Proxy(target.job || mockPrisma.job, {
        get(jobTarget, jobProp) {
          return async (...args) => {
            try {
              if (typeof jobTarget[jobProp] !== 'function') return undefined;
              return await jobTarget[jobProp](...args);
            } catch (err) {
              console.warn(`Prisma job.${jobProp} failed, routing through Mock Store:`, err.message);
              return await mockPrisma.job[jobProp](...args);
            }
          };
        }
      });
    }
    return target[prop];
  }
});

export default safePrisma;
