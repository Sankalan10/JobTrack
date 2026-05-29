import prisma from '../db.js';

export const seedDemoData = async (userId) => {
  const today = new Date();
  
  const akashResume = {
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
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      resumeUploaded: true,
      resumeData: JSON.stringify(akashResume)
    }
  });

  const formatDate = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const seedJobs = [
    // 1. Google (Interviewing)
    {
      company: 'Google',
      role: 'Software Engineer Intern',
      appliedDate: formatDate(-5),
      status: 'INTERVIEWING',
      salary: '₹85k/month',
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
      userId
    },
    // 2. Microsoft (Applied)
    {
      company: 'Microsoft',
      role: 'Full Stack Engineer',
      appliedDate: formatDate(-8),
      status: 'APPLIED',
      salary: '₹18,00,000',
      notes: 'Applied via referral. Awaiting initial recruiter call.',
      checklist: JSON.stringify([
        { id: '1', text: 'Tailor resume keywords', done: true },
        { id: '2', text: 'Review REST API design patterns', done: false }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      userId
    },
    // 3. Stripe (Offered)
    {
      company: 'Stripe',
      role: 'Frontend Developer',
      appliedDate: formatDate(-15),
      status: 'OFFERED',
      salary: '₹24,50,000',
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
      userId
    },
    // 4. Uber (Rejected)
    {
      company: 'Uber',
      role: 'Backend Engineer',
      appliedDate: formatDate(-12),
      status: 'REJECTED',
      salary: '₹75k/month',
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
      userId
    },
    // 5. Zomato (Applied)
    {
      company: 'Zomato',
      role: 'Software Engineer I',
      appliedDate: formatDate(-3),
      status: 'APPLIED',
      salary: '₹15,00,000',
      notes: 'Applied through Zomato Careers portal. Focused on high-performance API structures.',
      checklist: JSON.stringify([
        { id: '1', text: 'Align resume with Node.js and SQL skills', done: true }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      userId
    },
    // 6. Swiggy (Interviewing)
    {
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
      userId
    },
    // 7. CRED (Offered)
    {
      company: 'CRED',
      role: 'Backend Developer',
      appliedDate: formatDate(-20),
      status: 'OFFERED',
      salary: '₹32,00,000',
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
      userId
    },
    // 8. Razorpay (Interviewing)
    {
      company: 'Razorpay',
      role: 'Product Engineer Intern',
      appliedDate: formatDate(-4),
      status: 'INTERVIEWING',
      salary: '₹60k/month',
      interviewDate: formatDate(1),
      notes: 'Final round tomorrow! Will cover transactional systems, payment APIs, and system design basics.',
      checklist: JSON.stringify([
        { id: '1', text: 'Review database ACID compliance properties', done: true },
        { id: '2', text: 'Practice SQL optimization queries', done: false }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      userId
    },
    // 9. Paytm (Rejected)
    {
      company: 'Paytm',
      role: 'Software Engineer Intern',
      appliedDate: formatDate(-18),
      status: 'REJECTED',
      salary: '₹50k/month',
      notes: 'Completed all rounds successfully. Headcount froze for this quarter.',
      checklist: JSON.stringify([
        { id: '1', text: 'SDE coding test', done: true },
        { id: '2', text: 'Interview prep', done: true }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', action: 'Moved to "Rejected"', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      userId
    },
    // 10. Flipkart (Applied)
    {
      company: 'Flipkart',
      role: 'SDE-1',
      appliedDate: formatDate(-1),
      status: 'APPLIED',
      salary: '₹22,00,000',
      notes: 'Applied via employee referral. Resume successfully matches tech stack requirements.',
      checklist: JSON.stringify([
        { id: '1', text: 'Study data structure patterns (trees, graphs)', done: false }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      userId
    },
    // 11. TCS (Applied)
    {
      company: 'TCS',
      role: 'System Engineer',
      appliedDate: formatDate(-2),
      status: 'APPLIED',
      salary: '₹6,50,000',
      notes: 'Applied via National Qualifier Test (NQT). Qualified for main interview round.',
      checklist: JSON.stringify([
        { id: '1', text: 'Prepare OOPs principles review', done: true }
      ]),
      activityLog: JSON.stringify([
        { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ]),
      resumeMatcherData: '{}',
      userId
    }
  ];

  // Delete existing jobs for this user first to prevent duplication on multiple logins
  await prisma.job.deleteMany({ where: { userId } });

  for (const job of seedJobs) {
    await prisma.job.create({ data: job });
  }
};

export const seedAdditionalCandidates = async (passwordHash) => {
  const today = new Date();
  const formatDate = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  // 1. Priyanjali Sen
  const priyanjaliResume = {
    summary: "Detail-oriented Software Engineering student specialized in Data Science, statistical analysis, and machine learning models. Adept at transforming raw dataset parameters into actionable business insights and designing high-performance backend pipelines.",
    education: [
      {
        school: "Delhi Technological University (DTU)",
        degree: "B.Tech in Software Engineering",
        year: "2022 - 2026",
        gpa: "8.9/10 CGPA"
      }
    ],
    experience: [
      {
        company: "AnalyticsOne Lab",
        role: "Data Science Intern",
        duration: "Winter 2024",
        highlights: [
          "Designed and validated A/B testing frameworks for user acquisition campaigns, boosting conversions by 15%.",
          "Constructed ETL pipelines using Python and SQL to aggregate daily performance metrics for a high-volume product suite.",
          "Engineered interactive dashboards with React and D3.js to visualize machine learning evaluation metrics."
        ]
      }
    ],
    skills: ["Python", "statistics", "a/b testing", "sql optimization", "Data Science", "Machine Learning", "Pandas", "Scikit-Learn", "Go", "API Design", "React", "TypeScript"],
    projects: [
      {
        name: "Ad Campaign Analytics Suite",
        desc: "A data analysis tool that evaluates A/B testing parameters to predict and optimize advertisement conversions.",
        tech: ["Python", "Pandas", "Scikit-Learn"]
      }
    ]
  };

  let student2 = await prisma.user.findUnique({ where: { email: 'student2@jobtrack.com' } });
  if (!student2) {
    student2 = await prisma.user.create({
      data: {
        email: 'student2@jobtrack.com',
        password: passwordHash,
        name: 'Priyanjali Sen',
        role: 'STUDENT',
        resumeUploaded: true,
        resumeData: JSON.stringify(priyanjaliResume)
      }
    });

    const jobs = [
      {
        company: 'Google',
        role: 'Data Scientist Intern',
        appliedDate: formatDate(-6),
        status: 'INTERVIEWING',
        salary: '₹95k/month',
        interviewDate: formatDate(2),
        notes: 'Excited about the Google Ads data science team interview. Covered regression, tree-based models, and AB testing.',
        checklist: JSON.stringify([
          { id: '1', text: 'Study regression models', done: true },
          { id: '2', text: 'Review AB testing frameworks', done: true },
          { id: '3', text: 'Mock stats interview', done: false }
        ]),
        activityLog: JSON.stringify([
          { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() }
        ]),
        resumeMatcherData: JSON.stringify({
          matchScore: 85,
          matchedSkills: ['python', 'statistics', 'a/b testing'],
          missingSkills: ['sql optimization']
        }),
        userId: student2.id
      },
      {
        company: 'Stripe',
        role: 'Backend Engineer',
        appliedDate: formatDate(-4),
        status: 'APPLIED',
        salary: '₹22,00,000',
        notes: 'Applied via company careers page. Strong focus on Ruby/Go and API design.',
        checklist: JSON.stringify([
          { id: '1', text: 'Review Stripe API docs', done: true }
        ]),
        activityLog: JSON.stringify([
          { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() }
        ]),
        resumeMatcherData: JSON.stringify({
          matchScore: 72,
          matchedSkills: ['go', 'api design', 'rest'],
          missingSkills: ['ruby']
        }),
        userId: student2.id
      },
      {
        company: 'Zomato',
        role: 'Frontend Developer',
        appliedDate: formatDate(-12),
        status: 'OFFERED',
        salary: '₹19,00,000',
        notes: 'Offer letter received! Excellent team culture and modern tech stack.',
        checklist: JSON.stringify([
          { id: '1', text: 'Negotiation call', done: true }
        ]),
        activityLog: JSON.stringify([
          { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '2', action: 'Moved to "Offer Received 🎉"', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        ]),
        resumeMatcherData: JSON.stringify({
          matchScore: 90,
          matchedSkills: ['react', 'tailwind', 'typescript'],
          missingSkills: []
        }),
        userId: student2.id
      }
    ];

    for (const job of jobs) {
      await prisma.job.create({ data: job });
    }
  } else {
    // Always refresh and upgrade legacy candidate resume
    await prisma.user.update({
      where: { id: student2.id },
      data: {
        resumeUploaded: true,
        resumeData: JSON.stringify(priyanjaliResume)
      }
    });
  }

  // 2. Rohan Malhotra
  const rohanResume = {
    summary: "Creative Software Engineer and Product Lead focused on mobile architectures and agile systems. Experienced in designing interactive user interfaces with Swift/SwiftUI and orchestrating agile team sprints.",
    education: [
      {
        school: "Bits Pilani",
        degree: "B.E. in Computer Science",
        year: "2022 - 2026",
        gpa: "8.7/10 CGPA"
      }
    ],
    experience: [
      {
        company: "FintechMobile Co",
        role: "iOS Development Intern",
        duration: "Spring 2025",
        highlights: [
          "Co-developed a high-performance transactional mobile wallet UI using Swift, SwiftUI, and iOS SDK, scoring a 4.8/5 on App Store feedback.",
          "Reduced app launch latency by 30% by refactoring core local database caching mechanisms.",
          "Facilitated agile standups and PM scoping sprints to roadmap feature delivery across cross-functional teams."
        ]
      }
    ],
    skills: ["swift", "swiftui", "ios sdk", "objective-c", "Product Management", "Agile Sprints", "Node.js", "MongoDB", "System Design", "Git"],
    projects: [
      {
        name: "WalletApp Swift UI",
        desc: "A fully functional personal expense and investment tracker mobile application with real-time sync capabilities.",
        tech: ["Swift", "SwiftUI", "Combine"]
      }
    ]
  };

  let student3 = await prisma.user.findUnique({ where: { email: 'student3@jobtrack.com' } });
  if (!student3) {
    student3 = await prisma.user.create({
      data: {
        email: 'student3@jobtrack.com',
        password: passwordHash,
        name: 'Rohan Malhotra',
        role: 'STUDENT',
        resumeUploaded: true,
        resumeData: JSON.stringify(rohanResume)
      }
    });

    const jobs = [
      {
        company: 'Google',
        role: 'Product Manager Intern',
        appliedDate: formatDate(-3),
        status: 'APPLIED',
        salary: '₹90k/month',
        notes: 'Applied through university portal. High-interest product team position.',
        checklist: JSON.stringify([
          { id: '1', text: 'Read PM Case Study guide', done: false }
        ]),
        activityLog: JSON.stringify([
          { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ]),
        resumeMatcherData: JSON.stringify({
          matchScore: 61,
          matchedSkills: ['product management', 'agile'],
          missingSkills: ['data analytics']
        }),
        userId: student3.id
      },
      {
        company: 'Swiggy',
        role: 'Software Engineer',
        appliedDate: formatDate(-10),
        status: 'OFFERED',
        salary: '₹17,00,000',
        notes: 'Offer extended by hiring manager! Package breakdown includes base and performance bonuses.',
        checklist: JSON.stringify([
          { id: '1', text: 'Confirm joining date', done: true }
        ]),
        activityLog: JSON.stringify([
          { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '2', action: 'Moved to "Offer Received 🎉"', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ]),
        resumeMatcherData: JSON.stringify({
          matchScore: 88,
          matchedSkills: ['node.js', 'mongodb', 'system design'],
          missingSkills: []
        }),
        userId: student3.id
      },
      {
        company: 'CRED',
        role: 'iOS Developer',
        appliedDate: formatDate(-5),
        status: 'INTERVIEWING',
        salary: '₹28,00,000',
        interviewDate: formatDate(4),
        notes: 'Swift coding test cleared. Preparing for iOS SDK and architectural design rounds.',
        checklist: JSON.stringify([
          { id: '1', text: 'Study Swift concurrency', done: true },
          { id: '2', text: 'Review Clean Architecture in iOS', done: false }
        ]),
        activityLog: JSON.stringify([
          { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '2', action: 'Moved to "Interview Scheduled"', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ]),
        resumeMatcherData: JSON.stringify({
          matchScore: 82,
          matchedSkills: ['swift', 'swiftui', 'ios sdk'],
          missingSkills: ['objective-c']
        }),
        userId: student3.id
      }
    ];

    for (const job of jobs) {
      await prisma.job.create({ data: job });
    }
  } else {
    // Always refresh and upgrade legacy candidate resume
    await prisma.user.update({
      where: { id: student3.id },
      data: {
        resumeUploaded: true,
        resumeData: JSON.stringify(rohanResume)
      }
    });
  }

  // 8 additional students list with diverse skills & dynamic company distributions
  const extraCandidates = [
    {
      email: 'student4@jobtrack.com',
      name: 'Ishaan Sharma',
      resume: {
        summary: "Motivated Full Stack Web Developer with solid expertise in modern JavaScript frameworks, backend REST API design, and cloud containerization. Skilled in constructing highly optimized database schemas and responsive client UI flows.",
        education: [
          { school: "Delhi Technological University (DTU)", degree: "B.Tech in Information Technology", year: "2022 - 2026", gpa: "8.5/10 CGPA" }
        ],
        experience: [
          { company: "CloudScale Systems", role: "Software Intern", duration: "Winter 2024", highlights: ["Developed secure serverless Lambda handlers and REST APIs, reducing computation overhead by 12%.", "Engineered and Dockerized core backend microservices for automated client billing integrations."] }
        ],
        skills: ["React", "Node.js", "Express", "PostgreSQL", "Docker", "AWS Lambda", "JavaScript", "TypeScript", "REST APIs"],
        projects: [
          { name: "Serverless E-Commerce Gateway", desc: "A cloud-hosted serverless payment checkout workflow built using AWS Lambda and Node.js.", tech: ["AWS Lambda", "Node.js", "PostgreSQL"] }
        ]
      },
      jobs: [
        {
          company: 'Stripe',
          role: 'Full Stack Developer',
          appliedDate: formatDate(-3),
          status: 'INTERVIEWING',
          salary: '₹22,00,000',
          interviewDate: formatDate(3),
          notes: 'Prepped AWS, serverless execution parameters, and transactional APIs. Ready for system architecture review.',
          checklist: JSON.stringify([{ id: '1', text: 'Stripe API authentication patterns', done: true }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 89, matchedSkills: ['React', 'Node.js', 'REST APIs'], missingSkills: [] })
        },
        {
          company: 'CRED',
          role: 'Backend Developer',
          appliedDate: formatDate(-7),
          status: 'INTERVIEWING',
          salary: '₹26,00,000',
          interviewDate: formatDate(1),
          notes: 'CRED backend engineering round. Strong emphasis on concurrency and database connections.',
          checklist: JSON.stringify([{ id: '1', text: 'Confirm postgres schema optimizations', done: true }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 82, matchedSkills: ['Node.js', 'PostgreSQL'], missingSkills: [] })
        }
      ]
    },
    {
      email: 'student5@jobtrack.com',
      name: 'Kavya Nair',
      resume: {
        summary: "Detail-oriented Frontend Specialist with extensive knowledge in user accessibility, responsive design systems, and animated interactions using React & Tailwind. Passionate about building seamless, accessible pixel-perfect web screens.",
        education: [
          { school: "RV College of Engineering, Bengaluru", degree: "B.E. in Information Science", year: "2022 - 2026", gpa: "9.1/10 CGPA" }
        ],
        experience: [
          { company: "PixelPerfect Studio", role: "UI Development Intern", duration: "Summer 2025", highlights: ["Built a responsive component library using React, Tailwind CSS, and Storybook, lowering developer handoff times by 30%.", "Audited core enterprise pages for web accessibility (WCAG AA compliance) and optimized SEO tags."] }
        ],
        skills: ["React", "HTML5", "CSS3", "Tailwind CSS", "Storybook", "TypeScript", "Framer Motion", "UI Design", "Figma"],
        projects: [
          { name: "Glassmorphic Component Suite", desc: "A premium open-source collection of responsive glassmorphic widgets and layout grids built with Tailwind and Framer Motion.", tech: ["React", "Tailwind CSS", "Framer Motion"] }
        ]
      },
      jobs: [
        {
          company: 'Swiggy',
          role: 'Frontend Developer',
          appliedDate: formatDate(-5),
          status: 'INTERVIEWING',
          salary: '₹15,00,000',
          interviewDate: formatDate(4),
          notes: 'Swiggy web optimizations team interview. Focused on React code-splitting and responsive mobile frameworks.',
          checklist: JSON.stringify([{ id: '1', text: 'Review Vite compilation bundle chunking', done: true }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 92, matchedSkills: ['React', 'Tailwind CSS', 'TypeScript'], missingSkills: [] })
        },
        {
          company: 'Zomato',
          role: 'UI Developer',
          appliedDate: formatDate(-8),
          status: 'APPLIED',
          salary: '₹14,50,000',
          notes: 'Applied through employee referral. Focused on modular components and dynamic interactive animations.',
          checklist: JSON.stringify([{ id: '1', text: 'Tailor covers for Zomato product suite', done: true }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 78, matchedSkills: ['React', 'Figma'], missingSkills: [] })
        }
      ]
    },
    {
      email: 'student6@jobtrack.com',
      name: 'Arjun Mehta',
      resume: {
        summary: "Cloud Architect and Backend Developer focusing on high-volume scalable systems, microservice architectures, and relational database indexing. Proficient in Go and Python.",
        education: [
          { school: "VJTI, Mumbai", degree: "B.Tech in Computer Science", year: "2022 - 2026", gpa: "8.8/10 CGPA" }
        ],
        experience: [
          { company: "ScaleSolutions Inc", role: "Site Reliability Intern", duration: "Spring 2025", highlights: ["Refactored SQL query execution paths, saving over 40% on weekly database computation bills.", "Orchestrated CI/CD automated test pipelines using GitHub Actions, ensuring zero deployment down times."] }
        ],
        skills: ["Go", "Python", "SQL", "PostgreSQL", "System Design", "Microservices", "CI/CD", "Docker", "Kubernetes"],
        projects: [
          { name: "Scalable Event Bus", desc: "A concurrent transactional message bus capable of routing over 100k events/sec built using Go and gRPC channels.", tech: ["Go", "gRPC", "Docker"] }
        ]
      },
      jobs: [
        {
          company: 'Google',
          role: 'SDE Intern',
          appliedDate: formatDate(-4),
          status: 'INTERVIEWING',
          salary: '₹95,000/month',
          interviewDate: formatDate(2),
          notes: 'Google cloud platforms team interview. Concentrating on complex algorithms, systems concurrency, and indexing protocols.',
          checklist: JSON.stringify([{ id: '1', text: 'Brush up concurrency and locks', done: true }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 84, matchedSkills: ['Go', 'System Design', 'Microservices'], missingSkills: [] })
        },
        {
          company: 'Stripe',
          role: 'Platform Reliability Intern',
          appliedDate: formatDate(-9),
          status: 'APPLIED',
          salary: '₹24,00,000',
          notes: 'Awaiting HR scheduling call. Prepped Docker, Kubernetes configs, and PostgreSQL index schemas.',
          checklist: JSON.stringify([{ id: '1', text: 'Read reliability case studies', done: false }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 76, matchedSkills: ['Go', 'PostgreSQL', 'Docker'], missingSkills: [] })
        }
      ]
    },
    {
      email: 'student7@jobtrack.com',
      name: 'Ananya Iyer',
      resume: {
        summary: "Data Science student passionate about machine learning research, data processing pipeline optimizations, and implementing natural language processing (NLP) models.",
        education: [
          { school: "College of Engineering, Guindy, Chennai", degree: "B.Tech in Computer Science", year: "2022 - 2026", gpa: "9.3/10 CGPA" }
        ],
        experience: [
          { company: "NeuralMind Labs", role: "AI Research Fellow", duration: "Spring 2025", highlights: ["Fine-tuned transformer models for sentiment analysis on massive conversational datasets, hitting a 94.2% F1 score.", "Implemented automated scraping pipelines using Python and Scrapy, processing over 1M records daily."] }
        ],
        skills: ["Python", "Machine Learning", "Deep Learning", "NLP", "Pandas", "PyTorch", "Hugging Face", "Statistics", "SQL"],
        projects: [
          { name: "Clinical Report Analyzer", desc: "An automated clinical summary extraction engine built utilizing BERT embeddings and Hugging Face models.", tech: ["Python", "PyTorch", "Hugging Face"] }
        ]
      },
      jobs: [
        {
          company: 'Google',
          role: 'ML Research Intern',
          appliedDate: formatDate(-3),
          status: 'APPLIED',
          salary: '₹1,10,000/month',
          notes: 'Submitted resume to Google Brain AI research team. Reviewing PyTorch modules, mathematical derivatives, and stats benchmarks.',
          checklist: JSON.stringify([{ id: '1', text: 'Review neural net architecture patterns', done: false }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 91, matchedSkills: ['Python', 'PyTorch', 'Machine Learning'], missingSkills: [] })
        }
      ]
    },
    {
      email: 'student8@jobtrack.com',
      name: 'Kabir Malhotra',
      resume: {
        summary: "Skilled Mobile Applications Engineer with strong emphasis on Swift/SwiftUI and iOS architectures. Dedicated to shipping fluid, responsive native cache-driven natively designed mobile suites.",
        education: [
          { school: "BITS Pilani, Goa Campus", degree: "B.E. in Electronics & Communication", year: "2022 - 2026", gpa: "8.6/10 CGPA" }
        ],
        experience: [
          { company: "AppVantage Co", role: "Mobile Development Intern", duration: "Winter 2024", highlights: ["Co-developed an offline-first iOS chat client using SwiftUI and SQLite, driving a 30% surge in daily active metrics.", "Optimized rendering queues to guarantee 60fps scrolling on resource-heavy visual feeds."] }
        ],
        skills: ["Swift", "SwiftUI", "Combine", "iOS SDK", "Objective-C", "SQLite", "CoreData", "Git", "System Design"],
        projects: [
          { name: "Native Crypto Tracker", desc: "A native iOS app tracking real-time crypto price ticks using SwiftUI, Combine, and WebSockets.", tech: ["Swift", "SwiftUI", "Combine"] }
        ]
      },
      jobs: [
        {
          company: 'CRED',
          role: 'iOS Engineer',
          appliedDate: formatDate(-5),
          status: 'APPLIED',
          salary: '₹28,50,000',
          notes: 'Submitted native iOS portfolio to CRED mobile team. Polishing SwiftUI transitions, Combine state maps, and SQLite caching.',
          checklist: JSON.stringify([{ id: '1', text: 'Verify combine visual updates', done: true }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 88, matchedSkills: ['Swift', 'SwiftUI', 'iOS SDK'], missingSkills: [] })
        }
      ]
    },
    {
      email: 'student9@jobtrack.com',
      name: 'Riya Sen',
      resume: {
        summary: "Aspiring Product Associate and PM intern specialized in user journey mapping, visual wireframing, A/B testing, and translating technical scope maps into customer-centric software features.",
        education: [
          { school: "Jadavpur University, Kolkata", degree: "B.E. in Production Engineering", year: "2022 - 2026", gpa: "8.9/10 CGPA" }
        ],
        experience: [
          { company: "TechLaunch PM Labs", role: "Product Management Fellow", duration: "Summer 2025", highlights: ["Constructed comprehensive user persona journeys and feature requirements docs (FRDs) for automated user feedback tools.", "Conducted A/B testing iterations, raising product sign-up rates by 8% over standard control metrics."] }
        ],
        skills: ["Product Management", "A/B Testing", "Wireframing", "Figma", "User Research", "Agile", "SQL", "Excel", "Data Analytics"],
        projects: [
          { name: "SaaS Feedback Dashboard", desc: "A collaborative wireframe prototype and mock database map representing customer churn analytics portals.", tech: ["Figma", "SQL", "Agile"] }
        ]
      },
      jobs: [
        {
          company: 'Zomato',
          role: 'Associate Product Manager',
          appliedDate: formatDate(-6),
          status: 'INTERVIEWING',
          salary: '₹16,00,000',
          interviewDate: formatDate(5),
          notes: 'Zomato PM case interview. Prepped product metrics, customer funnel calculations, and food delivery flow optimizations.',
          checklist: JSON.stringify([{ id: '1', text: 'Practice metric analysis cases', done: true }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 90, matchedSkills: ['Product Management', 'A/B Testing', 'Figma'], missingSkills: [] })
        }
      ]
    },
    {
      email: 'student10@jobtrack.com',
      name: 'Aditya Goel',
      resume: {
        summary: "Security enthusiast and Backend Engineer focusing on web protocol layers, encryption patterns, secure authentication gates, and server-side logic in Go, Python, and SQL.",
        education: [
          { school: "IIIT Hyderabad", degree: "B.Tech in Computer Science", year: "2022 - 2026", gpa: "9.0/10 CGPA" }
        ],
        experience: [
          { company: "GuardNet Cybersecurity", role: "Security Engineering Intern", duration: "Spring 2025", highlights: ["Identified and successfully patched critical SQL Injection and XSS vulnerabilities on core platform routers.", "Integrated secure OAuth2 and JWT authentication handlers, boosting session security parameters across 10k accounts."] }
        ],
        skills: ["Go", "Python", "JWT", "OAuth2", "Cryptography", "SQL", "REST API", "Docker", "Linux"],
        projects: [
          { name: "Secure Vault Portal", desc: "A heavily encrypted credentials and file storage backend utilizing AES-256 protocols and strict JWT security validations.", tech: ["Go", "AES-256", "JWT"] }
        ]
      },
      jobs: [
        {
          company: 'Stripe',
          role: 'Security Engineer',
          appliedDate: formatDate(-10),
          status: 'OFFERED',
          salary: '₹25,00,000',
          notes: 'Offer extended! Absolutely thrilled to join Stripe security team. Package details received.',
          checklist: JSON.stringify([{ id: '1', text: 'Confirm final signing schedules', done: true }]),
          activityLog: JSON.stringify([
            { id: '1', action: 'Application tracked', date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() },
            { id: '2', action: 'Moved to "Offer Received 🎉"', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() }
          ]),
          resumeMatcherData: JSON.stringify({ matchScore: 94, matchedSkills: ['Go', 'JWT', 'Cryptography'], missingSkills: [] })
        }
      ]
    },
    {
      email: 'student11@jobtrack.com',
      name: 'Sneha Gupta',
      resume: {
        summary: "Dedicated Quality Assurance and Test Automation Engineer specialized in Selenium, Cypress, integration testing flows, and microservices automation frameworks.",
        education: [
          { school: "Amity University, Noida", degree: "B.Tech in Computer Science", year: "2022 - 2026", gpa: "8.4/10 CGPA" }
        ],
        experience: [
          { company: "TestAuto Labs", role: "Automation QA Fellow", duration: "Summer 2025", highlights: ["Automated end-to-end user path testing utilizing Cypress, raising test suite coverage indicators to 95%.", "Configured nightly regression suites, reducing critical integration escape indicators by 18%."] }
        ],
        skills: ["Cypress", "Selenium", "JavaScript", "Python", "Automation Testing", "SQL", "Jenkins", "Git", "API Testing"],
        projects: [
          { name: "Continuous Integration Suite", desc: "An automated regression testing container built utilizing Docker, Jenkins, and Cypress automation rules.", tech: ["Cypress", "Jenkins", "Docker"] }
        ]
      },
      jobs: [
        {
          company: 'Swiggy',
          role: 'QA Automation Engineer',
          appliedDate: formatDate(-4),
          status: 'APPLIED',
          salary: '₹12,00,000',
          notes: 'Applied on Swiggy tech careers portal. Polishing test suites, Cypress execution rules, and API validation maps.',
          checklist: JSON.stringify([{ id: '1', text: 'Create automated regression pipelines', done: true }]),
          activityLog: JSON.stringify([{ id: '1', action: 'Application tracked', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() }]),
          resumeMatcherData: JSON.stringify({ matchScore: 86, matchedSkills: ['Cypress', 'Automation Testing', 'JavaScript'], missingSkills: [] })
        }
      ]
    }
  ];

  // Dynamic seed execution loop
  for (const cand of extraCandidates) {
    let student = await prisma.user.findUnique({ where: { email: cand.email } });
    if (!student) {
      student = await prisma.user.create({
        data: {
          email: cand.email,
          password: passwordHash,
          name: cand.name,
          role: 'STUDENT',
          resumeUploaded: true,
          resumeData: JSON.stringify(cand.resume)
        }
      });
      
      for (const jobPayload of cand.jobs) {
        await prisma.job.create({
          data: {
            ...jobPayload,
            userId: student.id
          }
        });
      }
    } else {
      // Always upgrade profile resumes & sync jobs cleanly
      await prisma.user.update({
        where: { id: student.id },
        data: {
          resumeUploaded: true,
          resumeData: JSON.stringify(cand.resume)
        }
      });

      for (const jobPayload of cand.jobs) {
        const existingJob = await prisma.job.findFirst({
          where: {
            userId: student.id,
            company: jobPayload.company,
            role: jobPayload.role
          }
        });
        if (!existingJob) {
          await prisma.job.create({
            data: {
              ...jobPayload,
              userId: student.id
            }
          });
        }
      }
    }
  }
  
  // Always refresh legacy candidate resume backgrounds for Akash Das to guarantee clean single seed states
  let studentDemo = await prisma.user.findUnique({ where: { email: 'demo@jobtrack.com' } });
  if (studentDemo) {
    await prisma.user.update({
      where: { id: studentDemo.id },
      data: { resumeUploaded: true }
    });
  }
};
