
import type { Assessment, AssessmentCategory, Question, AppTheme } from './types';

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  'AI/ML',
  'Web Development',
  'Data Structures',
  'Cybersecurity',
  'Cloud Computing',
];

const sampleAIMLQuestions: Question[] = [
  {
    id: 'q1_aiml_intro',
    questionText: 'What is the primary goal of supervised learning?',
    options: ['To find hidden patterns in unlabeled data', 'To learn a mapping function from input to output based on labeled examples', 'To make decisions based on a reward system', 'To reduce the dimensionality of data'],
    correctAnswer: 'To learn a mapping function from input to output based on labeled examples',
    type: 'multiple-choice',
  },
  {
    id: 'q2_aiml_intro',
    questionText: 'Which of these is a common algorithm for classification?',
    options: ['K-Means Clustering', 'Linear Regression', 'Support Vector Machine (SVM)', 'Principal Component Analysis (PCA)'],
    correctAnswer: 'Support Vector Machine (SVM)',
    type: 'multiple-choice',
  },
  {
    id: 'q3_aiml_intro',
    questionText: 'Overfitting occurs when a model performs well on training data but poorly on unseen data.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    type: 'true-false',
  },
  {
    id: 'q4_aiml_intro',
    questionText: 'What is "feature scaling" in machine learning?',
    options: ['Increasing the number of features', 'Normalizing the range of independent variables or features of data', 'Selecting the most important features', 'Creating new features from existing ones'],
    correctAnswer: 'Normalizing the range of independent variables or features of data',
    type: 'multiple-choice',
  },
  {
    id: 'q5_aiml_intro',
    questionText: 'Reinforcement learning involves an agent learning by interacting with an environment.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    type: 'true-false',
  }
];

const sampleWebDevQuestions: Question[] = [
  {
    id: 'q1_web_intro',
    questionText: 'What does HTML stand for?',
    options: ['HyperText Markup Language', 'HighText Machine Language', 'HyperText and links Markup Language', 'None of the above'],
    correctAnswer: 'HyperText Markup Language',
    type: 'multiple-choice',
  },
  {
    id: 'q2_web_intro',
    questionText: 'Which property is used in CSS to change the text color of an element?',
    options: ['font-color', 'text-color', 'color', 'background-color'],
    correctAnswer: 'color',
    type: 'multiple-choice',
  },
  {
    id: 'q3_web_intro',
    questionText: 'JavaScript can only be used for front-end development.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    type: 'true-false',
  },
  {
    id: 'q4_web_intro',
    questionText: 'What is the purpose of a "viewport" meta tag in HTML?',
    options: ['To set the background color', 'To control the layout on mobile browsers', 'To define the character set', 'To link external stylesheets'],
    correctAnswer: 'To control the layout on mobile browsers',
    type: 'multiple-choice',
  },
  {
    id: 'q5_web_intro',
    questionText: 'The `alt` attribute in an `<img>` tag is optional for accessibility.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    type: 'true-false',
  }
];

const sampleAdvJSQuestions: Question[] = [
  { id: 'q1_adv_js', questionText: 'What is a closure in JavaScript?', options: ['A function having access to its own scope', 'A function having access to the parent scope, even after the parent function has closed', 'A way to lock variables', 'An object property'], correctAnswer: 'A function having access to the parent scope, even after the parent function has closed', type: 'multiple-choice' },
  { id: 'q2_adv_js', questionText: '`this` keyword in an arrow function refers to the `this` of its surrounding lexical context.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false' },
  { id: 'q3_adv_js', questionText: 'What does `Promise.all()` do?', options: ['Executes all promises sequentially', 'Takes an iterable of promises and returns a single promise that resolves when all of the promises in the iterable argument have resolved', 'Returns the first promise that resolves', 'Catches errors from any promise in the iterable'], correctAnswer: 'Takes an iterable of promises and returns a single promise that resolves when all of the promises in the iterable argument have resolved', type: 'multiple-choice'},
  { id: 'q4_adv_js', questionText: 'What is event delegation in JavaScript?', options: ['Assigning multiple event listeners to one element', 'A technique where you add a single event listener to a parent element to manage events for all its children', 'Preventing events from bubbling up the DOM tree', 'Creating custom events'], correctAnswer: 'A technique where you add a single event listener to a parent element to manage events for all its children', type: 'multiple-choice'},
  { id: 'q5_adv_js', questionText: 'The `async` keyword before a function makes the function return a Promise.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false'},
];

const samplePythonDSQuestions: Question[] = [
   { id: 'q1_py_ds', questionText: 'Which library is commonly used for numerical computing in Python?', options: ['Pandas', 'NumPy', 'Matplotlib', 'SciPy'], correctAnswer: 'NumPy', type: 'multiple-choice' },
   { id: 'q2_py_ds', questionText: 'Pandas DataFrame is a 2-dimensional labeled data structure.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false' },
   { id: 'q3_py_ds', questionText: 'What function in Pandas is used to read a CSV file?', options: ['read_file()', 'open_csv()', 'read_csv()', 'load_csv()'], correctAnswer: 'read_csv()', type: 'multiple-choice'},
   { id: 'q4_py_ds', questionText: 'Matplotlib is primarily used for:', options: ['Data manipulation', 'Machine learning model training', 'Creating static, animated, and interactive visualizations', 'Web scraping'], correctAnswer: 'Creating static, animated, and interactive visualizations', type: 'multiple-choice'},
   { id: 'q5_py_ds', questionText: 'A Jupyter Notebook allows mixing code, text, and visualizations in one document.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false'},
];

const sampleDataStructuresQuestions: Question[] = [
  { id: 'ds_q1', questionText: 'What is the time complexity of searching in a balanced Binary Search Tree (BST)?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctAnswer: 'O(log n)', type: 'multiple-choice' },
  { id: 'ds_q2', questionText: 'Which of these is NOT a linear data structure?', options: ['Array', 'Stack', 'Queue', 'Tree'], correctAnswer: 'Tree', type: 'multiple-choice' },
  { id: 'ds_q3', questionText: 'A queue follows the FIFO (First In, First Out) principle.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false' },
  { id: 'ds_q4', questionText: 'What is a hash collision?', options: ['When two different keys produce the same hash value', 'When a hash function is too slow', 'When a hash table is full', 'When a key is not found in the hash table'], correctAnswer: 'When two different keys produce the same hash value', type: 'multiple-choice' },
  { id: 'ds_q5', questionText: 'Depth First Search (DFS) uses a stack to keep track of vertices.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false' },
];

const sampleCybersecurityQuestions: Question[] = [
  { id: 'cs_q1', questionText: 'What does "CIA Triad" stand for in cybersecurity?', options: ['Confidentiality, Integrity, Availability', 'Control, Information, Access', 'Cybersecurity, Intelligence, Analysis', 'Compliance, Investigation, Audit'], correctAnswer: 'Confidentiality, Integrity, Availability', type: 'multiple-choice' },
  { id: 'cs_q2', questionText: 'Which of the following is a common type of malware?', options: ['Firewall', 'Ransomware', 'VPN', 'Antivirus'], correctAnswer: 'Ransomware', type: 'multiple-choice' },
  { id: 'cs_q3', questionText: 'Phishing is an attempt to acquire sensitive information by masquerading as a trustworthy entity.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false' },
  { id: 'cs_q4', questionText: 'What is the primary purpose of a firewall?', options: ['To encrypt data', 'To prevent unauthorized access to or from a private network', 'To detect viruses', 'To backup data'], correctAnswer: 'To prevent unauthorized access to or from a private network', type: 'multiple-choice' },
  { id: 'cs_q5', questionText: 'Using the same password for multiple accounts is a good security practice.', options: ['True', 'False'], correctAnswer: 'False', type: 'true-false' },
];

const sampleCloudComputingQuestions: Question[] = [
  { id: 'cc_q1', questionText: 'What does "SaaS" stand for in cloud computing?', options: ['Software as a Service', 'Storage as a Service', 'Security as a Service', 'System as a Service'], correctAnswer: 'Software as a Service', type: 'multiple-choice' },
  { id: 'cc_q2', questionText: 'Which cloud service model typically provides virtual machines, storage, and networks?', options: ['PaaS', 'IaaS', 'SaaS', 'FaaS'], correctAnswer: 'IaaS', type: 'multiple-choice' },
  { id: 'cc_q3', questionText: 'A "public cloud" is owned and operated by a third-party cloud service provider.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false' },
  { id: 'cc_q4', questionText: 'What is "elasticity" in the context of cloud computing?', options: ['The ability to automatically scale resources up or down based on demand', 'The geographical distribution of cloud services', 'The security measures in place', 'The speed of data transfer'], correctAnswer: 'The ability to automatically scale resources up or down based on demand', type: 'multiple-choice' },
  { id: 'cc_q5', questionText: 'Hybrid cloud refers to a combination of public and private clouds.', options: ['True', 'False'], correctAnswer: 'True', type: 'true-false' },
];


export const PREDEFINED_ASSESSMENTS: Assessment[] = [
  {
    id: 'intro-to-aiml',
    title: 'Introduction to AI/ML Concepts',
    category: 'AI/ML',
    description: 'Test your basic understanding of Artificial Intelligence and Machine Learning. Covers supervised learning, classification, and core concepts.',
    questions: sampleAIMLQuestions,
    durationMinutes: 15,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), 
    upvotes: 0,
    downvotes: 0,
    isPredefined: true,
  },
  {
    id: 'web-dev-fundamentals',
    title: 'Web Development Fundamentals',
    category: 'Web Development',
    description: 'Assess your knowledge of core web technologies like HTML, CSS, and JavaScript. Includes questions on syntax, properties, and basic functionality.',
    questions: sampleWebDevQuestions,
    durationMinutes: 20,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), 
    upvotes: 0,
    downvotes: 0,
    isPredefined: true,
  },
  {
    id: 'advanced-js-concepts',
    title: 'Advanced JavaScript Concepts',
    category: 'Web Development',
    description: 'Dive deeper into JavaScript, including closures, prototypes, async patterns, and event handling.',
    questions: sampleAdvJSQuestions,
    durationMinutes: 25,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    upvotes: 0,
    downvotes: 0,
    isPredefined: true,
  },
  {
    id: 'python-for-data-science',
    title: 'Python for Data Science',
    category: 'AI/ML',
    description: 'Assess your Python skills relevant to data analysis and machine learning, focusing on NumPy, Pandas, and Matplotlib.',
    questions: samplePythonDSQuestions,
    durationMinutes: 20,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
    upvotes: 0,
    downvotes: 0,
    isPredefined: true,
  },
  {
    id: 'data-structures-advanced',
    title: 'Advanced Data Structures',
    category: 'Data Structures',
    description: 'Test your knowledge of advanced data structures including trees, graphs, and hash tables, along with their complexities.',
    questions: sampleDataStructuresQuestions, 
    durationMinutes: 30,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    upvotes: 0,
    downvotes: 0,
    isPredefined: true,
  },
  {
    id: 'cybersecurity-essentials',
    title: 'Cybersecurity Essentials',
    category: 'Cybersecurity',
    description: 'Covers fundamental cybersecurity concepts like the CIA triad, malware types, phishing, and firewall basics.',
    questions: sampleCybersecurityQuestions, 
    durationMinutes: 20,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    upvotes: 0,
    downvotes: 0,
    isPredefined: true,
  },
  {
    id: 'cloud-computing-fundamentals',
    title: 'Cloud Computing Fundamentals',
    category: 'Cloud Computing',
    description: 'Explore basic cloud computing models (IaaS, PaaS, SaaS), deployment types, and core concepts like elasticity.',
    questions: sampleCloudComputingQuestions, 
    durationMinutes: 20,
    createdAt: new Date().toISOString(), 
    upvotes: 0,
    downvotes: 0,
    isPredefined: true,
  }
];

export const NAV_LINKS = [
  { href: '/', label: 'Home', icon: 'Home' },
  { href: '/assessments', label: 'Assessments', icon: 'BookOpenCheck' },
  { href: '/assessments/create', label: 'Create Assessment', icon: 'PlusSquare' },
  { href: '/profile', label: 'Profile', icon: 'UserCircle' },
  { href: '/admin', label: 'Admin', icon: 'ShieldCheck', adminOnly: true },
];

export const LOCAL_STORAGE_THEME_KEY = "eduAssessTheme";
export const LOCAL_STORAGE_THEME_MODE_KEY = "eduAssessThemeMode";


export const DEFAULT_THEME_NAME = "QuestionFlow Default";

export const APP_THEMES: AppTheme[] = [
  {
    name: DEFAULT_THEME_NAME,
    light: {
      background: "210 40% 98%",
      foreground: "210 40% 3.9%",
      card: "210 40% 98%",
      cardForeground: "210 40% 3.9%",
      popover: "210 40% 98%",
      popoverForeground: "210 40% 3.9%",
      primary: "351 92% 60%", // Crimson Red
      primaryForeground: "0 0% 98%",
      secondary: "210 40% 96.1%",
      secondaryForeground: "210 40% 9%",
      muted: "210 40% 96.1%",
      mutedForeground: "210 40% 45.1%",
      accent: "332 47% 36%", // Plum
      accentForeground: "0 0% 98%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "210 40% 89.8%",
      input: "210 40% 89.8%",
      ring: "351 92% 60%",
    },
    dark: {
      background: "0 0% 17%", // Dark Burgundy
      foreground: "0 0% 98%",
      card: "0 0% 12%",
      cardForeground: "0 0% 98%",
      popover: "0 0% 10%",
      popoverForeground: "0 0% 98%",
      primary: "351 92% 60%", // Crimson Red
      primaryForeground: "0 0% 98%",
      secondary: "0 0% 25%",
      secondaryForeground: "0 0% 98%",
      muted: "0 0% 25%",
      mutedForeground: "0 0% 63.9%",
      accent: "332 47% 36%", // Plum
      accentForeground: "0 0% 98%",
      destructive: "0 72.2% 50.6%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 25%",
      input: "0 0% 20%",
      ring: "351 92% 50%",
    },
  },
  {
    name: "Ocean Breeze",
    light: {
      background: "200 100% 97%", // Very Light Blue
      foreground: "210 50% 20%", // Dark Blue-Gray
      card: "200 100% 99%",
      cardForeground: "210 50% 20%",
      popover: "200 100% 99%",
      popoverForeground: "210 50% 20%",
      primary: "210 79% 46%", // Bright Blue
      primaryForeground: "0 0% 100%",
      secondary: "190 60% 90%",
      secondaryForeground: "190 50% 25%",
      muted: "190 60% 90%",
      mutedForeground: "190 40% 55%",
      accent: "180 65% 45%", // Teal
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "200 50% 85%",
      input: "200 50% 90%",
      ring: "210 79% 46%",
    },
    dark: {
      background: "220 40% 10%", // Dark Navy
      foreground: "200 30% 90%", // Light Bluish Gray
      card: "220 40% 15%",
      cardForeground: "200 30% 90%",
      popover: "220 40% 12%",
      popoverForeground: "200 30% 90%",
      primary: "205 90% 65%", // Lighter Bright Blue
      primaryForeground: "220 40% 5%",
      secondary: "220 30% 20%",
      secondaryForeground: "200 30% 90%",
      muted: "220 30% 20%",
      mutedForeground: "200 20% 60%",
      accent: "175 80% 55%", // Cyan
      accentForeground: "220 40% 5%",
      destructive: "0 72.2% 50.6%",
      destructiveForeground: "0 0% 98%",
      border: "220 30% 25%",
      input: "220 30% 18%",
      ring: "205 90% 65%",
    },
  },
  {
    name: "Forest Whisper",
    light: {
      background: "45 50% 96%", // Light Beige
      foreground: "90 30% 20%", // Dark Green-Gray
      card: "45 50% 98%",
      cardForeground: "90 30% 20%",
      popover: "45 50% 98%",
      popoverForeground: "90 30% 20%",
      primary: "120 50% 40%", // Forest Green
      primaryForeground: "0 0% 100%",
      secondary: "100 30% 88%",
      secondaryForeground: "100 25% 25%",
      muted: "100 30% 88%",
      mutedForeground: "100 20% 50%",
      accent: "30 40% 45%", // Brown
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "60 30% 80%",
      input: "60 30% 85%",
      ring: "120 50% 40%",
    },
    dark: {
      background: "100 15% 12%", // Dark Green-Gray
      foreground: "80 25% 88%", // Light Greenish Gray
      card: "100 15% 18%",
      cardForeground: "80 25% 88%",
      popover: "100 15% 15%",
      popoverForeground: "80 25% 88%",
      primary: "130 65% 55%", // Brighter Green
      primaryForeground: "100 15% 5%",
      secondary: "100 10% 22%",
      secondaryForeground: "80 25% 88%",
      muted: "100 10% 22%",
      mutedForeground: "80 15% 60%",
      accent: "40 35% 60%", // Light Brown
      accentForeground: "100 15% 5%",
      destructive: "0 72.2% 50.6%",
      destructiveForeground: "0 0% 98%",
      border: "100 10% 28%",
      input: "100 10% 20%",
      ring: "130 65% 55%",
    },
  },
  {
    name: "Sunset Glow",
    light: {
      background: "40 100% 95%", // Pale Yellow
      foreground: "20 50% 25%", // Dark Brown-Orange
      card: "40 100% 97%",
      cardForeground: "20 50% 25%",
      popover: "40 100% 97%",
      popoverForeground: "20 50% 25%",
      primary: "25 90% 55%", // Bright Orange
      primaryForeground: "0 0% 100%",
      secondary: "30 80% 90%",
      secondaryForeground: "30 40% 30%",
      muted: "30 80% 90%",
      mutedForeground: "30 30% 55%",
      accent: "0 80% 60%", // Red
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "35 70% 85%",
      input: "35 70% 90%",
      ring: "25 90% 55%",
    },
    dark: {
      background: "280 20% 10%", // Dark Purple-Gray
      foreground: "30 80% 90%", // Light Orange-Yellow
      card: "280 20% 15%",
      cardForeground: "30 80% 90%",
      popover: "280 20% 12%",
      popoverForeground: "30 80% 90%",
      primary: "30 100% 60%", // Brighter Orange
      primaryForeground: "280 20% 5%",
      secondary: "280 15% 20%",
      secondaryForeground: "30 80% 90%",
      muted: "280 15% 20%",
      mutedForeground: "30 40% 60%",
      accent: "50 100% 55%", // Yellow
      accentForeground: "280 20% 5%",
      destructive: "0 72.2% 50.6%",
      destructiveForeground: "0 0% 98%",
      border: "280 15% 25%",
      input: "280 15% 18%",
      ring: "30 100% 60%",
    },
  },
  {
    name: "Monochrome Matrix",
    light: {
      background: "0 0% 100%", // White
      foreground: "0 0% 10%", // Near Black
      card: "0 0% 98%",
      cardForeground: "0 0% 10%",
      popover: "0 0% 98%",
      popoverForeground: "0 0% 10%",
      primary: "0 0% 20%", // Dark Gray
      primaryForeground: "0 0% 95%",
      secondary: "0 0% 90%",
      secondaryForeground: "0 0% 15%",
      muted: "0 0% 90%",
      mutedForeground: "0 0% 40%",
      accent: "0 0% 50%", // Medium Gray
      accentForeground: "0 0% 95%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 85%",
      input: "0 0% 90%",
      ring: "0 0% 20%",
    },
    dark: {
      background: "0 0% 8%", // Near Black
      foreground: "0 0% 92%", // Light Gray
      card: "0 0% 12%",
      cardForeground: "0 0% 92%",
      popover: "0 0% 10%",
      popoverForeground: "0 0% 92%",
      primary: "0 0% 85%", // Light Gray
      primaryForeground: "0 0% 5%",
      secondary: "0 0% 20%",
      secondaryForeground: "0 0% 92%",
      muted: "0 0% 20%",
      mutedForeground: "0 0% 60%",
      accent: "0 0% 45%", // Mid Gray
      accentForeground: "0 0% 5%",
      destructive: "0 72.2% 50.6%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 25%",
      input: "0 0% 18%",
      ring: "0 0% 85%",
    },
  },
];

    