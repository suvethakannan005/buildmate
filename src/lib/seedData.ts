import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const seedSampleData = async () => {
  try {
    // Check if data already exists to avoid duplicates
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.size > 5) {
      console.log('Sample data already exists');
      return;
    }

    const sampleUsers = [
      {
        uid: 'user_1',
        name: 'Arun Kumar',
        email: 'arun@example.com',
        role: 'freelancer',
        skillsOffered: ['React', 'Node.js', 'Tailwind CSS'],
        skillsWanted: ['Figma', 'UI Design'],
        github: 'https://github.com/arun',
        linkedin: 'https://linkedin.com/in/arun',
        portfolio: ['E-commerce App', 'Portfolio Website'],
        bio: 'Full-stack developer with 3 years of experience in React and Node.js. Love teaching and building scalable apps.',
        createdAt: serverTimestamp(),
      },
      {
        uid: 'user_2',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        role: 'student',
        skillsOffered: ['Python', 'Data Science', 'SQL'],
        skillsWanted: ['React', 'JavaScript'],
        github: 'https://github.com/priya',
        linkedin: 'https://linkedin.com/in/priya',
        portfolio: ['Stock Predictor', 'Sales Dashboard'],
        bio: 'Data science enthusiast. Proficient in Python and SQL. Looking to learn frontend development.',
        createdAt: serverTimestamp(),
      },
      {
        uid: 'user_3',
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        role: 'entrepreneur',
        skillsOffered: ['Product Management', 'Marketing'],
        skillsWanted: ['Full Stack Dev', 'AI/ML'],
        github: 'https://github.com/vikram',
        linkedin: 'https://linkedin.com/in/vikram',
        portfolio: ['SaaS Startup', 'Mobile App Concept'],
        bio: 'Serial entrepreneur with a background in marketing and product. Eager to learn technical skills to build my own MVPs.',
        createdAt: serverTimestamp(),
      },
    ];

    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.uid), user);
    }

    const sampleProjects = [
      {
        title: 'Eco-Track App',
        description: 'A mobile application to track personal carbon footprint and suggest sustainable alternatives for daily activities.',
        domain: 'Sustainability',
        ownerId: 'user_3',
        rolesNeeded: ['React Native Dev', 'UI Designer', 'Backend Engineer'],
        visibility: 'public',
        status: 'open',
        team: ['user_3'],
        githubLink: 'https://github.com/buildmate/eco-track',
        createdAt: serverTimestamp(),
      },
      {
        title: 'AI Study Buddy',
        description: 'An AI-powered platform that summarizes textbooks and generates practice quizzes for students.',
        domain: 'EdTech',
        ownerId: 'user_2',
        rolesNeeded: ['Python Dev', 'Frontend Dev'],
        visibility: 'public',
        status: 'in-progress',
        team: ['user_2', 'user_1'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'HealthSync Wearable',
        description: 'Open-source firmware for health tracking wearables with a focus on data privacy.',
        domain: 'HealthTech',
        ownerId: 'user_1',
        rolesNeeded: ['Embedded Systems', 'C++', 'Mobile Dev'],
        visibility: 'public',
        status: 'open',
        team: ['user_1'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'Local Food Connect',
        description: 'Platform connecting local farmers directly with urban consumers to reduce food miles.',
        domain: 'AgriTech',
        ownerId: 'user_3',
        rolesNeeded: ['Full Stack Dev', 'Logistics Expert'],
        visibility: 'public',
        status: 'open',
        team: ['user_3'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'CodeMentor AI',
        description: 'Real-time pair programming assistant using LLMs to help beginners learn coding patterns.',
        domain: 'EdTech',
        ownerId: 'user_2',
        rolesNeeded: ['AI Engineer', 'VS Code Extension Dev'],
        visibility: 'public',
        status: 'open',
        team: ['user_2'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'Smart City Traffic',
        description: 'Using computer vision to optimize traffic light timings in real-time based on vehicle density.',
        domain: 'Smart City',
        ownerId: 'user_1',
        rolesNeeded: ['Computer Vision', 'Python', 'IoT'],
        visibility: 'public',
        status: 'open',
        team: ['user_1'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'SkillSwap Marketplace',
        description: 'A decentralized platform for trading professional services without currency.',
        domain: 'FinTech',
        ownerId: 'user_3',
        rolesNeeded: ['Blockchain Dev', 'Solidity', 'React'],
        visibility: 'public',
        status: 'open',
        team: ['user_3'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'Mental Health Companion',
        description: 'An anonymous support network for students dealing with academic stress and anxiety.',
        domain: 'HealthTech',
        ownerId: 'user_2',
        rolesNeeded: ['UX Researcher', 'React Dev', 'Psychologist'],
        visibility: 'public',
        status: 'open',
        team: ['user_2'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'Open Source CRM',
        description: 'A lightweight CRM built specifically for non-profits and small community groups.',
        domain: 'SaaS',
        ownerId: 'user_1',
        rolesNeeded: ['Backend Dev', 'Database Architect'],
        visibility: 'public',
        status: 'open',
        team: ['user_1'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'Virtual Event Space',
        description: '3D interactive environment for hosting remote workshops and networking events.',
        domain: 'Events',
        ownerId: 'user_3',
        rolesNeeded: ['Three.js', 'WebXR', 'Frontend'],
        visibility: 'public',
        status: 'open',
        team: ['user_3'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'Personal Finance Bot',
        description: 'Telegram bot that helps users track expenses and set savings goals using natural language.',
        domain: 'FinTech',
        ownerId: 'user_2',
        rolesNeeded: ['Node.js', 'Bot API', 'NLP'],
        visibility: 'public',
        status: 'open',
        team: ['user_2'],
        createdAt: serverTimestamp(),
      },
      {
        title: 'Community Garden Map',
        description: 'Interactive map for urban dwellers to find and contribute to local community gardens.',
        domain: 'Environment',
        ownerId: 'user_1',
        rolesNeeded: ['GIS Specialist', 'React', 'Maps API'],
        visibility: 'public',
        status: 'open',
        team: ['user_1'],
        createdAt: serverTimestamp(),
      }
    ];

    for (const project of sampleProjects) {
      await addDoc(collection(db, 'projects'), project);
    }

    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
