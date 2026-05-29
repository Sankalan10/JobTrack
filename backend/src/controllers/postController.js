import crypto from 'crypto';
import prisma from '../db.js';
import axios from 'axios';
import { decryptJoobleKey } from '../utils/security.js';

// Pre-seeded high-fidelity professional recruiting posts
let posts = [
  {
    id: 'google-seed-post-1',
    company: 'Google',
    authorName: 'Siddharth Malhotra',
    authorTitle: 'Lead SDE Talent Partner at Google India',
    avatarText: 'SM',
    content: "Hi everyone! 🚀 We are officially opening early applications for the Software Engineer Intern role for Summer 2026. If you have solid foundations in Data Structures, Algorithms, and React/Node, we want you! Package highlights: ₹95,000/month stipend with standard Google perks. Apply directly through your JobTrack dashboard now! 💻🌟 #GoogleCareers #SDE #Internship",
    likes: 142,
    likedBy: [],
    comments: [
      { id: 'c1', author: 'Akash Das', text: 'Stunning opportunity! Just finished applying directly.', date: '1 hour ago' },
      { id: 'c2', author: 'Priyanjali Sen', text: 'Does this role require familiarity with Kubernetes?', date: '45 mins ago' }
    ],
    roleLink: { company: 'Google', role: 'Software Engineer Intern' },
    postImage: '/google_careers_banner.png',
    date: '2 hours ago'
  },
  {
    id: 'stripe-seed-post-1',
    company: 'Stripe',
    authorName: 'Madhavan Nair',
    authorTitle: 'Staff Security Lead at Stripe India',
    avatarText: 'MN',
    content: "Exciting news! We are expanding our Mumbai security engineering hub! We are looking for a Security Engineer to build secure, robust transaction layers. Strong Go/Python expertise and solid cryptography principles are required. Package offered: ₹25,00,000 LPA base with CRED options. Let's secure payment layers globally! 💳🛡️ #StripeJobs #SiteReliability #Security",
    likes: 98,
    likedBy: [],
    comments: [
      { id: 'c3', author: 'Aditya Goel', text: 'Applied! Very excited about secure transaction systems.', date: '3 hours ago' }
    ],
    roleLink: { company: 'Stripe', role: 'Security Engineer' },
    postImage: '/stripe_security_banner.png',
    date: '4 hours ago'
  },
  {
    id: 'swiggy-seed-post-1',
    company: 'Swiggy',
    authorName: 'Priya Sharma',
    authorTitle: 'Talent Acquisition Lead at Swiggy',
    avatarText: 'PS',
    content: "Hungry for code? 🍔 Swiggy is hiring a Frontend Developer to optimize our micro-frontend applications. If you love building smooth 60fps animations in React, Tailwind, and Vite, we'd love to chat. Apply directly and let's deliver delight! 🚀🔥 #SwiggyCareers #FrontendDeveloper #React",
    likes: 115,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Swiggy', role: 'Frontend Developer' },
    postImage: '/swiggy_frontend_banner.png',
    date: '5 hours ago'
  },
  {
    id: 'cred-seed-post-1',
    company: 'CRED',
    authorName: 'Kunal Shah',
    authorTitle: 'Founder, CRED',
    avatarText: 'KS',
    content: "Design is not just what it looks like. It's how it works. We are looking for an iOS Engineer who understands native SwiftUI, core memory footprints, and high-fidelity tactile UI journeys. Salary offered: ₹28,50,000. Apply directly through your JobTrack dashboard today. 💳✨ #CRED #iOSDevelopment #SwiftUI",
    likes: 254,
    likedBy: [],
    comments: [
      { id: 'c4', author: 'Rohan Malhotra', text: 'The native tactile scrolling on iOS SwiftUI is state-of-the-art.', date: '2 hours ago' }
    ],
    roleLink: { company: 'CRED', role: 'iOS Engineer' },
    postImage: '/cred_ios_banner.png',
    date: '6 hours ago'
  },
  {
    id: 'zomato-seed-post-1',
    company: 'Zomato',
    authorName: 'Deepinder Goyal',
    authorTitle: 'CEO, Zomato',
    avatarText: 'DG',
    content: "Zomato is searching for an Associate Product Manager (APM) who can own product journeys and A/B test funnels. If you love food, analytics, and translating technical scope maps into customer-centric metrics, apply now! 📈🥘 #ZomatoCareers #ProductManagement #APM",
    likes: 187,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Zomato', role: 'Associate Product Manager' },
    postImage: '/zomato_apm_banner.png',
    date: '1 day ago'
  },
  {
    id: 'google-seed-post-2',
    company: 'Google',
    authorName: 'Rohan Sen',
    authorTitle: 'Engineering Director at Google Cloud India',
    avatarText: 'RS',
    content: "Greetings! 🌐 Google Cloud India is looking to hire a Cloud Solutions Engineer in Hyderabad. If you are passionate about helping enterprises architect their infrastructure, and have solid experience with Kubernetes, Terraform, and Python, let's connect! Salary: ₹22,00,000 LPA base. Apply directly in your dashboard today! ☁️✨ #GoogleCloud #SolutionsEngineering #CloudComputing",
    likes: 198,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Google', role: 'Cloud Solutions Engineer' },
    date: '12 hours ago'
  },
  {
    id: 'microsoft-seed-post-1',
    company: 'Microsoft',
    authorName: 'Ananya Roy',
    authorTitle: 'Senior Talent Acquisition Lead at Microsoft',
    avatarText: 'AR',
    content: "Hello team! 🌐 We are scale-building the core Azure Infrastructure division in Bengaluru and Hyderabad. We are opening slots for an Azure Cloud Architect to engineer ultra-scalable microservices frameworks and optimize serverless telemetry pipelines. Strong hands-on C#, Go, and distributed systems architecture are required. Compensation: ₹24 LPA base package. Let's build the future of cloud! ☁️🚀 #MicrosoftCareers #CloudArchitecture #Azure",
    likes: 210,
    likedBy: [],
    comments: [
      { id: 'c5', author: 'Akash Das', text: 'An absolute dream role! Fits my cloud architecture prep perfectly.', date: '1 day ago' }
    ],
    roleLink: { company: 'Microsoft', role: 'Azure Cloud Architect' },
    postImage: '/microsoft_careers_banner.png',
    date: '1 day ago'
  },
  {
    id: 'microsoft-seed-post-2',
    company: 'Microsoft',
    authorName: 'Divya Joshi',
    authorTitle: 'Talent Acquisition Specialist at Microsoft India',
    avatarText: 'DJ',
    content: "Hello tech community! 📊 Microsoft's AI and Data Science division in Bengaluru is growing. We are opening slots for a Data Scientist to build next-gen predictive models and LLM wrappers. If you have solid foundations in Python, PyTorch, SQL, and statistics, we want you! Package: ₹23,00,000 LPA base. Let's engineer smart intelligence! 🤖📈 #MicrosoftCareers #DataScience #MachineLearning #LLM",
    likes: 145,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Microsoft', role: 'Data Scientist' },
    date: '18 hours ago'
  },
  {
    id: 'swiggy-seed-post-2',
    company: 'Swiggy',
    authorName: 'Suresh Iyengar',
    authorTitle: 'VP of Engineering at Swiggy India',
    avatarText: 'SI',
    content: "Hey devs! 🍔 We are scale-building our food delivery core pipelines at Swiggy. We are opening applications for a Backend DevOps Engineer to optimize Docker/Kubernetes orchestration and build secure AWS CI/CD workflows. Strong shell scripting and Go/Python skills are highly valued. Compensation: ₹20 LPA base. Let's make food deliveries lightning fast! 🚀🔥 #SwiggyJobs #DevOps #SRE #Docker",
    likes: 132,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Swiggy', role: 'Backend DevOps Engineer' },
    postImage: '/generic_hiring_banner.png',
    date: '1 day ago'
  },
  {
    id: 'flipkart-seed-post-1',
    company: 'Flipkart',
    authorName: 'Amit Verma',
    authorTitle: 'Director of Engineering at Flipkart',
    avatarText: 'AV',
    content: "Big Billion Days are coming! 🛒🔥 We are looking for a Backend Engineer wizard to join our Core Checkout systems team. You will design high-concurrency architectures handling 50k+ write requests per second. Strong expertise in Java, Spring Boot, Kafka, and Redis caching is non-negotiable. Package: ₹21 LPA base. Apply with 1-click now! 💻📈 #FlipkartCareers #BackendEngineering #Java #Spring",
    likes: 167,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Flipkart', role: 'Backend Engineer' },
    date: '2 days ago'
  },
  {
    id: 'razorpay-seed-post-1',
    company: 'Razorpay',
    authorName: 'Harshil Mathur',
    authorTitle: 'Co-founder & CEO, Razorpay',
    avatarText: 'HM',
    content: "Fintech is undergoing a massive transformation. 💳⚡ We are expanding our core Payment Gateway engineering division! We need a brilliant Full Stack Engineer who excels in React, Node.js, and high-security REST APIs. You will own merchants workflows and payment integrations handling millions of transactions. Package: ₹18.5 LPA base. Apply directly through your JobTrack dashboard! 🚀🔥 #Razorpay #Fintech #React #NodeJS",
    likes: 189,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Razorpay', role: 'Full Stack Engineer' },
    postImage: '/generic_hiring_banner.png',
    date: '3 days ago'
  },
  {
    id: 'paytm-seed-post-1',
    company: 'Paytm',
    authorName: 'Vijay Shekhar Sharma',
    authorTitle: 'Founder & CEO, Paytm',
    avatarText: 'VS',
    content: "India's digital payments are scaling faster than ever. 💳🔥 Paytm is looking for a Fintech Operations Specialist in Noida to oversee merchant settlement architectures and fraud detection funnels. Strong SQL, data analytics, and dashboarding capabilities are required. Compensation package: ₹12 LPA base. Apply with 1-click now! ⚡📊 #PaytmJobs #FintechOperations #NoidaCareers",
    likes: 289,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Paytm', role: 'Fintech Operations Specialist' },
    postImage: '/paytm_hiring_banner.png',
    date: '2 days ago'
  },
  {
    id: 'tcs-seed-post-1',
    company: 'TCS',
    authorName: 'Karan Aggarwal',
    authorTitle: 'Principal Talent Consultant at TCS',
    avatarText: 'KA',
    content: "Greetings! 🌐 TCS is launching its premium recruitment drive for Systems Engineers. We are looking for talented candidates to join our core cloud integration client teams. Solid baseline knowledge of Java, C++, or SQL is required. Package: ₹8 LPA starting package with global learning tracks. Let's digitize enterprise operations together! 💼🚀 #TCSJobs #SystemsEngineering #CloudIntegration",
    likes: 310,
    likedBy: [],
    comments: [],
    roleLink: { company: 'TCS', role: 'Systems Engineer' },
    date: '3 days ago'
  },
  {
    id: 'uber-seed-post-1',
    company: 'Uber',
    authorName: 'Nitin Gupta',
    authorTitle: 'Senior Director of Engineering at Uber India Tech',
    avatarText: 'NG',
    content: "Let's keep the world moving! 🚗⚡ Uber India is hiring a Senior Backend Developer in Bengaluru. You will own core dispatch algorithms and real-time mapping microservices. Strong multi-threading knowledge in Java/Go and high-scale system design are key. Compensation: ₹32,00,000 LPA base with stock options. Apply directly! 📈🔥 #UberCareers #BackendDeveloper #BengaluruTech",
    likes: 224,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Uber', role: 'Senior Backend Developer' },
    postImage: '/uber_tech_banner.png',
    date: '4 days ago'
  },
  {
    id: 'swiggy-seed-post-3',
    company: 'Swiggy',
    authorName: 'Priya Sharma',
    authorTitle: 'Talent Acquisition Lead at Swiggy',
    avatarText: 'PS',
    content: "We are scale-expanding our Instamart logistics and supply-chain engineering systems in Bengaluru. If you have solid systems understanding of React Native, Node.js, and high-precision mapping tracking, apply to our Mobile Developer role now! 🚀🛵 #SwiggyCareers #ReactNative #MobileDev",
    likes: 84,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Swiggy', role: 'React Native Developer' },
    postImage: '/swiggy_frontend_banner.png',
    date: '6 hours ago'
  },
  {
    id: 'stripe-seed-post-2',
    company: 'Stripe',
    authorName: 'Madhavan Nair',
    authorTitle: 'Staff Security Lead at Stripe India',
    avatarText: 'MN',
    content: "Looking to architect developer ecosystems? 💳 Stripe India is hiring a Developer Relations Engineer in Bengaluru! You will write developer SDKs, publish code guides, and engage with the fintech developer community globally. Package: ₹22 LPA. 🚀✨ #StripeCareers #DevRel #Fintech",
    likes: 92,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Stripe', role: 'Developer Relations Engineer' },
    postImage: '/stripe_security_banner.png',
    date: '8 hours ago'
  },
  {
    id: 'google-seed-post-3',
    company: 'Google',
    authorName: 'Siddharth Malhotra',
    authorTitle: 'Lead SDE Talent Partner at Google India',
    avatarText: 'SM',
    content: "Google Workspace India is expanding! We are opening applications for a Frontend Engineer - Google Meet. If you are passionate about WebRTC, real-time video optimizations, and high-scale canvas rendering, apply today! Stipend: ₹95,000/mo. 💻📺 #GoogleCareers #WebRTC #Frontend",
    likes: 156,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Google', role: 'Frontend Engineer - Google Meet' },
    postImage: '/google_careers_banner.png',
    date: '10 hours ago'
  },
  {
    id: 'uber-seed-post-2',
    company: 'Uber',
    authorName: 'Nitin Gupta',
    authorTitle: 'Senior Director of Engineering at Uber India Tech',
    avatarText: 'NG',
    content: "Rethinking urban mobility! 🚗⚡ Uber India Tech is hiring a Data Engineer in Hyderabad. You will build high-fidelity telemetry pipelines, architect real-time trip logs, and parse petabytes of geolocation databases. Package: ₹28 LPA base. 📈🔥 #UberCareers #DataEngineering #BigData",
    likes: 112,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Uber', role: 'Data Engineer' },
    postImage: '/uber_tech_banner.png',
    date: '18 hours ago'
  },
  {
    id: 'paytm-seed-post-2',
    company: 'Paytm',
    authorName: 'Vijay Shekhar Sharma',
    authorTitle: 'Founder & CEO, Paytm',
    avatarText: 'VS',
    content: "Soundbox is reshaping retail across India! 🔊 Paytm is recruiting a hardware-integrated Software Engineer in Noida. If you excel in IoT frameworks, embedded C++, and high-speed telemetry, join us! Salary package: ₹15 LPA. 💳⚡ #PaytmJobs #IoT #EmbeddedSystems #NoidaTech",
    likes: 218,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Paytm', role: 'IoT Software Engineer' },
    postImage: '/paytm_hiring_banner.png',
    date: '1 day ago'
  },
  {
    id: 'microsoft-seed-post-3',
    company: 'Microsoft',
    authorName: 'Ananya Roy',
    authorTitle: 'Senior Talent Acquisition Lead at Microsoft',
    avatarText: 'AR',
    content: "Are you passionate about Developer Tools? 💻 Microsoft is hiring a Software Engineer - VS Code Team in Hyderabad! Contribute directly to the most popular editor in the world, optimizing extension hosts and high-fidelity text renders. Package: ₹24 LPA base. 🌐🚀 #MicrosoftCareers #VSCode #TypeScript",
    likes: 184,
    likedBy: [],
    comments: [],
    roleLink: { company: 'Microsoft', role: 'Software Engineer - VS Code Team' },
    postImage: '/microsoft_careers_banner.png',
    date: '1 day ago'
  },
  {
    id: 'google-seed-post-form-1',
    company: 'Google',
    authorName: 'Rohan Sen',
    authorTitle: 'Engineering Director at Google Cloud India',
    avatarText: 'RS',
    content: "Greetings tech community! 🌐 To help candidate applicants match top-tier ATS requirements and align coding preparation, I am hosting a series of Mock Interview & Tech Mentorship Sessions. Fill up your requirements in the form below regarding the interview topic and details. My team will review and schedule slots in real-time! 🤝⚡ #TechMentorship #GoogleCloud #MockInterviews",
    likes: 312,
    likedBy: [],
    comments: [],
    isFormPost: true,
    date: '3 hours ago'
  }
];

// GET: Fetch all social posts (including live Jooble positions interweaved!)
export const getPosts = async (req, res) => {
  try {
    const currentUserId = req.user?.userId;
    
    // Map existing in-memory posts to include hasLiked flag
    const mappedUserPosts = posts.map(post => ({
      ...post,
      hasLiked: post.likedBy.includes(currentUserId)
    }));

    // Dynamic Live Jooble Integration
    const joobleApiKey = decryptJoobleKey();
    let jooblePosts = [];
    
    if (joobleApiKey) {
      try {
        console.log(`[SocialFeed] Querying live Jooble positions to enrich community feed...`);
        const joobleUrl = `https://jooble.org/api/${joobleApiKey}`;
        
        // Fetch 5 hot React Developer positions in India
        const response = await axios.post(joobleUrl, {
          keywords: 'React Developer',
          location: 'India',
          page: '1'
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 4000 // Fast timeout to avoid delaying the social feed render
        });

        if (response.data && response.data.jobs) {
          const stripHtml = (str) => {
            if (!str) return '';
            return str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/gi, ' ');
          };

          jooblePosts = response.data.jobs.slice(0, 5).map((item, idx) => {
            const companyName = item.company || 'Premium Tech Brand';
            const cleanTitle = stripHtml(item.title);
            const cleanDesc = stripHtml(item.snippet || '');
            const cleanLocation = item.location || 'India';
            const cleanSalary = item.salary || 'Salary not listed';
            const initials = companyName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            return {
              id: `jbl-post-${item.id}`,
              company: companyName,
              authorName: `${companyName} Careers Bot`,
              authorTitle: `Verified Sourced Opening • ${cleanLocation}`,
              avatarText: initials || 'JB',
              content: `Hello developers! 🚀 ${companyName} is actively seeking a talented React developer to join their crew in ${cleanLocation} as a ${cleanTitle}. \n\nJob Summary: ${cleanDesc.substring(0, 220)}... \n\nCompensation Package: ${cleanSalary}. Feel free to check the details and apply direct using the card below! #Opportunity #Careers #${companyName.replace(/[^a-zA-Z]/g, '')}`,
              likes: 12 + (idx * 17) % 67, // Generate stable, realistic likes
              likedBy: [],
              comments: [],
              roleLink: { company: companyName, role: cleanTitle },
              date: 'Live Now 💎',
              postImage: idx % 2 === 0 ? '/generic_hiring_banner.png' : null,
              hasLiked: false,
              isJoobleSourced: true
            };
          });
        }
      } catch (err) {
        // Secure log masking: ensure API key doesn't leak in feed load errors
        const safeMsg = err.message ? err.message.replace(joobleApiKey, '[REDACTED_API_KEY]') : 'Unknown error';
        console.error('[SocialFeed] Failed to enrich feed with Jooble jobs:', safeMsg);
      }
    }

    // Intersperse: interweave live Jooble jobs into the user feed list
    const combinedFeed = [];
    const maxLen = Math.max(mappedUserPosts.length, jooblePosts.length);
    
    for (let i = 0; i < maxLen; i++) {
      if (i < mappedUserPosts.length) {
        combinedFeed.push(mappedUserPosts[i]);
      }
      if (i < jooblePosts.length) {
        combinedFeed.push(jooblePosts[i]);
      }
    }

    res.json(combinedFeed);
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: 'Failed to retrieve social feed posts' });
  }
};

// POST: Create a new social feed post (Collaborative LinkedIn-style)
export const createPost = async (req, res) => {
  const { content, roleLink, postImage } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }

  try {
    // Fetch user details from Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const isRecruiter = user.role === 'RECRUITER';
    const firstCompany = isRecruiter && user.company ? user.company.split(',')[0].trim() : 'Student';
    const authorTitle = isRecruiter 
      ? `Talent Partner at ${firstCompany}` 
      : 'Student / Aspiring Developer';
    
    const authorInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const newPost = {
      id: crypto.randomUUID ? crypto.randomUUID() : `post-${Date.now()}`,
      userId: user.id, // Store ownership ID
      company: firstCompany,
      authorName: user.name,
      authorTitle: authorTitle,
      avatarText: authorInitials || 'ST',
      content: content.trim(),
      likes: 0,
      likedBy: [],
      comments: [],
      roleLink: roleLink || null,
      postImage: postImage !== undefined ? postImage : null,
      date: 'Just now'
    };

    posts.unshift(newPost); // Add to top of feed
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to publish post update' });
  }
};

// POST: Like/Unlike a post
export const likePost = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.userId;

  try {
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likedIndex = post.likedBy.indexOf(currentUserId);
    let hasLiked = false;

    if (likedIndex > -1) {
      // User has already liked, so UNLIKE it!
      post.likedBy.splice(likedIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
      hasLiked = false;
    } else {
      // User has not liked, so LIKE it!
      post.likedBy.push(currentUserId);
      post.likes += 1;
      hasLiked = true;
    }

    res.json({ id: post.id, likes: post.likes, hasLiked });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to change post reaction' });
  }
};

// POST: Comment on a post
export const commentOnPost = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text cannot be empty' });
  }

  try {
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Fetch commenter name from Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { name: true }
    });

    const commenterName = user?.name || 'Candidate';

    const newComment = {
      id: `comment-${Date.now()}`,
      author: commenterName,
      text: text.trim(),
      date: 'Just now'
    };

    post.comments.push(newComment);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Comment post error:', error);
    res.status(500).json({ error: 'Failed to append comment' });
  }
};

// PUT: Edit an existing user post
export const editPost = async (req, res) => {
  const { id } = req.params;
  const { content, roleLink } = req.body;
  const currentUserId = req.user?.userId;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }

  try {
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Secure checking: only the author can edit their post
    if (post.userId && post.userId !== currentUserId) {
      return res.status(403).json({ error: 'Access denied: You can only edit your own posts' });
    }

    post.content = content.trim();
    if (roleLink !== undefined) {
      post.roleLink = roleLink;
    }

    res.json(post);
  } catch (error) {
    console.error('Edit post error:', error);
    res.status(500).json({ error: 'Failed to edit post' });
  }
};

// DELETE: Delete an existing user post
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.userId;

  try {
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[postIndex];
    
    // Secure checking: only the author can delete their post
    if (post.userId && post.userId !== currentUserId) {
      return res.status(403).json({ error: 'Access denied: You can only delete your own posts' });
    }

    posts.splice(postIndex, 1);
    res.json({ message: 'Post successfully deleted', id });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
