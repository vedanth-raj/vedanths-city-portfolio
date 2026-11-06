/* ==========================================================================
   VEE'S MEMORY · everything the chatbot knows about Vedanth
   Sourced from the resume (Oct 2026) and this site. Edit here and the
   on-page chatbot updates. (server/profile.md is the same story for the
   optional AI backend.)
   ========================================================================== */

export const ME = {
  name: 'Vedanth Raj',
  legal: 'P V V Raj',
  first: 'Vedanth',
  title: 'AI/ML & Full-Stack Cloud Developer',
  city: 'Hyderabad, India',
  tz: 'IST, UTC+5:30',
  email: 'pvvraj1234433@gmail.com',
  phone: '+91 88971 28321',
  phoneHref: 'tel:+918897128321',
  linkedin: 'https://linkedin.com/in/vedanth-raj',
  github: 'https://github.com/vedanth-raj',
  degree: "B.Tech in Computer Science & Engineering (Data Science)",
  college: "SVKM's NMIMS, STME Hyderabad",
  years: '2023 – 2027',
  cgpa: '7.25 / 10',
  pitch:
    'a CSE (Data Science) student at NMIMS Hyderabad and an AWS Student Builder Campus Leader. He builds intelligent, scalable systems: serverless GenAI apps on AWS, real-time computer vision and full-stack platforms.',
  stats: '4+ internships, 15+ systems built, 7 AWS services in a single production-style app',
};

export const COURSEWORK = [
  'Data Structures & Algorithms', 'Object-Oriented Programming', 'DBMS', 'Operating Systems', 'Computer Networks',
  'Machine Learning', 'Data Analytics', 'Artificial Intelligence', 'Linear Programming & Optimization',
];

/* ---------- experience ---------- */
export const ROLES = [
  {
    id: 'aws',
    org: 'Amazon Web Services',
    role: 'Student Builder Campus Leader (SBCL) & Student Builder Group Leader (SBGL)',
    when: 'Jul 2026 – present',
    aliases: ['aws', 'amazon web services', 'amazon', 'sbcl', 'sbgl', 'student builder', 'campus leader', 'group leader', 'builder program'],
    what: "He leads AWS's Student Builder initiative on campus: a 6-week, outcome-driven cloud program, live demos of Amazon Bedrock, Cognito, Lambda and DynamoDB, and university-wide sessions.",
    more: 'He guides peers through hands-on AWS projects (implementation, troubleshooting, architecture demos) and mentors them one-on-one. One of his sessions: "Secure with AWS: User Verification with Amazon Cognito".',
  },
  {
    id: 'infosys',
    org: 'Infosys',
    role: 'Full-Stack Developer Intern',
    when: 'Dec 2025 – Feb 2026',
    aliases: ['infosys', 'infosis', 'infy'],
    what: 'He built an AI system that reviews, parses and summarises research papers: NLP models behind a responsive web frontend and high-throughput REST APIs.',
    more: 'Day to day that meant feature implementation, debugging, testing, Git-based version control and code reviews, turning requirements into maintainable components.',
  },
  {
    id: 'innobyte',
    org: 'InnoByte Services',
    role: 'Web Developer Intern',
    when: 'Nov 2025',
    aliases: ['innobyte', 'inno byte', 'innobyte services'],
    what: 'He shipped responsive, cross-browser web apps with HTML5, CSS3 and JavaScript in a fast sprint.',
    more: 'He also owned testing, bug fixing and technical documentation for what he shipped.',
  },
  {
    id: 'gudsky',
    org: 'Gudsky Research Foundation',
    role: 'Research Intern',
    when: 'Jun 2025 – Nov 2025',
    aliases: ['gudsky', 'gud sky', 'gudsky research', 'research foundation'],
    what: 'He did quantitative research: statistical analysis and data cleaning on research datasets, plus technical reports and reviews.',
    more: 'It is where he sharpened his data-analysis and documentation habits, and it fed into his published paper.',
  },
  {
    id: 'espiratia',
    org: 'Espiratia',
    role: 'Data Insight & Market Research Intern',
    when: 'Jun – Sep 2025, remote',
    aliases: ['espiratia', 'espiratia internship', 'market research'],
    what: 'He ran competitive market research, KPI tracking and database querying, working with international stakeholders.',
    more: 'It was remote, so most of the work was async communication and turning data into clear findings.',
  },
];

/* ---------- projects ---------- */
export const PROJECTS = [
  {
    id: 'recipe',
    name: 'AI Recipe Generator',
    aliases: ['recipe', 'recipes', 'ai recipe', 'recipe generator', 'recipe gen', 'recipe app', 'bedrock app', 'titan'],
    one: 'A serverless GenAI app that personalises recipes with Amazon Bedrock (Titan Text), across 7 AWS services.',
    how: 'The app is served from S3 + CloudFront. Users sign in with Cognito (JWT), calls go through API Gateway to 5 independently deployed Lambda functions, Bedrock writes the recipe and DynamoDB stores it. The whole stack is in CloudFormation, with CloudWatch for monitoring.',
    stack: ['Amazon Bedrock (Titan Text)', '5 × AWS Lambda', 'API Gateway', 'Cognito', 'DynamoDB', 'S3 + CloudFront', 'CloudFormation', 'CloudWatch', 'JavaScript'],
    impact: 'He designed it to scale horizontally, targeting 1M+ requests a month, with filters for cuisine, diet and prep time.',
    challenge: 'Almost all the latency is the model call, so he built the Lambdas to shape tight prompts and retry with backoff when Bedrock throttles. The "Follow one request" section on this page walks through it hop by hop.',
  },
  {
    id: 'face',
    name: 'Face Authentication Attendance System',
    aliases: ['face auth', 'face authentication', 'face recognition', 'facial recognition', 'attendance', 'attendance system', 'face', 'faceauth'],
    one: 'Real-time face verification that marks attendance from a live video stream.',
    how: 'It is a 7-stage computer-vision pipeline: webcam frames stream over Socket.io to a Python server, MTCNN finds the face, Dlib aligns the landmarks, ResNet-50 turns it into an embedding, and a distance threshold matches it against enrolled faces before attendance is written.',
    stack: ['Python', 'OpenCV', 'MTCNN', 'Dlib', 'ResNet-50', 'Socket.io'],
    impact: '98.5% accuracy on 500+ images across 50 employees, with about 50 ms inference.',
    challenge: 'Tuning the match threshold from 0.6 to 0.4 eliminated false positives and cut end-to-end processing time by 90%, while keeping 97.8% precision.',
  },
  {
    id: 'hospital',
    name: 'Smart Hospital Management System',
    aliases: ['smart hospital', 'hospital', 'hospital management', 'healthcare platform', 'healthcare', 'hms'],
    one: 'A full-stack healthcare platform for appointments and clinical operations.',
    how: 'Four role-based dashboards (Admin, Doctor, Receptionist, Patient) behind role-based access control, across 8+ modules: patients and appointments, doctor schedules and prescriptions, bed allocation, emergency requests with driver assignment, billing and analytics. Built with Next.js and React, Firebase and an Express API.',
    stack: ['Next.js', 'React', 'TypeScript', 'Firebase', 'Express', 'Tailwind CSS', 'Recharts'],
    impact: '4 user roles and 8+ feature modules, each role seeing only what it should.',
    challenge: 'Role-based access: the same screen has to hide, lock and log itself per role. You can try it in the "Switch a role" demo on this page.',
  },
  {
    id: 'aquaflow',
    name: 'AquaFlow',
    aliases: ['aquaflow', 'aqua flow', 'swimming pool', 'swimming', 'pool', 'indian railway', 'indian railways', 'railway', 'railways', 'freelance project'],
    one: 'A swimming-pool membership and operations platform, built and deployed as a freelance project for Indian Railways.',
    how: 'An admin dashboard covers member registration, payment tracking, a priority-based waitlist, automated billing and renewal notifications (SMTP via PHPMailer) and renewal-date simulation.',
    stack: ['JavaScript', 'Tailwind CSS', 'Vite', 'SMTP / PHPMailer'],
    impact: 'A real client in production: Indian Railways uses it to run memberships.',
    challenge: 'Working with a real client meant turning operational rules (renewals, waitlists, overdue payments) into workflows staff could actually run.',
  },
  {
    id: 'litwise',
    name: 'LitWise AI',
    aliases: ['litwise', 'lit wise', 'litwise ai', 'research agent', 'ai research agent', 'paper agent', 'research paper review', 'r-a', 'semantic scholar', 'literature review'],
    one: 'An NLP system that finds research papers, reads them and drafts a reviewed literature summary. He built it as his Infosys Springboard internship project.',
    how: 'It searches Semantic Scholar, arXiv and OpenAlex, extracts text with PyMuPDF, segments each paper into IMRaD sections, scores readability and keywords (domain-augmented TF-IDF), writes extractive summaries, synthesises across papers with Gemini 2.5, formats references to APA 7 and runs a self-correcting review loop.',
    stack: ['Python', 'Flask', 'Gemini 2.5', 'PyMuPDF', 'ReportLab', 'Semantic Scholar API', 'arXiv', 'OpenAlex'],
    impact: 'Section segmentation runs at over 92% precision, and the self-review loop lifts quality scores from about 0.70 to 0.79+.',
    challenge: 'Scientific PDFs are messy (multi-column layouts, equations, odd headers), so reliable extraction and section detection came before any summarising.',
  },
  {
    id: 'anpr',
    name: 'ANPR (Automatic Number Plate Recognition)',
    aliases: ['anpr', 'number plate', 'number plates', 'license plate', 'licence plate', 'plate recognition', 'plate', 'vehicle', 'yolo project'],
    one: 'Detects number plates in real time, reads them with OCR and logs every vehicle to MySQL.',
    how: 'YOLOv10n finds the plate, OpenCV crops and deskews it, Tesseract reads the characters, a validator checks the Indian plate format, and MySQL stores it searchable by plate and time.',
    stack: ['YOLOv10n', 'OpenCV', 'Tesseract OCR', 'MySQL', 'Python'],
    impact: 'Every vehicle at the gate becomes a searchable record.',
    challenge: 'Blurry plates: when OCR confidence is low it re-thresholds and sharpens the crop, then reads again.',
  },
  { id: 'memorytrack', name: 'MemoryTrack', aliases: ['memorytrack', 'memory track', 're-identification', 'reidentification', 're-id', 'reid', 'person tracking'], one: 'Person re-identification (built with C. Harini) that works without a clear face: it fuses appearance, pose, colour and motion into a 720-D vector searched with FAISS, and explains every match cue by cue.', stack: ['Python', 'Computer vision', 'FAISS'] },
  { id: 'voting', name: 'Campus Voting System', aliases: ['campus voting', 'voting', 'voting app', 'ballot', 'polls'], one: 'Flutter + Firebase ballots with OTP login, admin poll controls and real-time tallies.', stack: ['Flutter', 'Firebase'] },
  { id: 'dayplanner', name: 'DayPlanner App', aliases: ['dayplanner', 'day planner', 'planner app', 'planner'], one: 'A Flutter productivity app with priority queues, reminders and offline storage.', stack: ['Flutter', 'Firebase'] },
  { id: 'care4u', name: 'Care_4_U Hospital', aliases: ['care_4_u', 'care 4 u', 'care4u', 'care for you', 'care 4u'], one: 'An appointment portal on AWS EC2 with DynamoDB, SNS, S3 and CloudFront.', stack: ['AWS EC2', 'DynamoDB', 'SNS', 'S3', 'CloudFront'] },
  { id: 'plant', name: 'PlantVillage Classifier', aliases: ['plantvillage', 'plant village', 'crop disease', 'plant disease', 'leaf classifier'], one: 'A deep-learning crop-disease classifier trained on 128×128 leaf images.', stack: ['Python', 'Deep learning'] },
  { id: 'medledger', name: 'MedLedger / TrialLink', aliases: ['medledger', 'triallink', 'trial link', 'blockchain', 'clinical trial'], one: 'A blockchain concept for clinical-trial data provenance.', stack: ['Blockchain'] },
  { id: 'syllabus', name: 'Syllabus Tracker', aliases: ['syllabus tracker', 'syllabus'], one: 'A Power BI dashboard tracking academic progress and KPIs.', stack: ['Power BI'] },
  { id: 'voice', name: 'Voice Meeting Assistant', aliases: ['voice meeting', 'meeting assistant', 'voice assistant', 'transcription', 'whisper'], one: 'Records a meeting, transcribes it with Whisper, summarises it with T5 and extracts action items (FastAPI + React; v3 deploys on Render).', stack: ['Python', 'FastAPI', 'React', 'Whisper', 'T5'] },
  { id: 'sentrix', name: 'Sentrix v2.0', aliases: ['sentrix', 'sentrix v2', 'vehicle detection'], one: 'The next generation of his ANPR work: YOLOv8 vehicle detection and plate reading through six OCR engines at 30–60 FPS (about 7× faster than v1), 95%+ plate accuracy, with optional AWS S3 + Rekognition.', stack: ['Python', 'YOLOv8', 'OpenCV', 'EasyOCR', 'PaddleOCR', 'AWS Rekognition'] },
  { id: 'mirage', name: 'MIRAGE', aliases: ['mirage', 'jwst', 'exoplanet', 'exoplanets', 'astronomy', 'flow matching', 'wasp-39b'], one: 'Team research project on ML retrieval of exoplanet atmospheres from real JWST spectra: a transformer encoder plus a noise-conditioned flow-matching posterior with optimal-transport calibration. Key finding on WASP-39b: the sim-to-real gap came from a radius/baseline degeneracy. It generalises across 3 planets and 2 instruments and is archived on Zenodo; preliminary results target the NeurIPS ML4PS workshop. He worked on the data and modelling notebooks.', stack: ['Python', 'PyTorch', 'Flow matching', 'JWST data'] },
  { id: 'dermaegis', name: 'DermAegis AI', aliases: ['dermaegis', 'derm aegis', 'dermagis', 'skin lesion', 'skin cancer', 'ham10000', 'dermatology'], one: 'Team project he contributed to: 7-class skin-lesion classification on HAM10000 with EfficientNetB3, Monte Carlo Dropout uncertainty, Grad-CAM explanations and test-time augmentation (React + FastAPI, plus a Hugging Face Spaces app). A research tool, not a medical device.', stack: ['Python', 'TensorFlow', 'EfficientNetB3', 'FastAPI', 'React'] },
  { id: 'reloop', name: 'ReLoop', aliases: ['reloop', 're loop', 'sustainability app', 'circular economy'], one: 'An AWS serverless PWA that finds a second life for pre-loved items (sell, exchange, donate, repair or recycle): React + TypeScript, Cognito, API Gateway, DynamoDB, S3 presigned uploads, deployed with AWS CDK.', stack: ['React', 'TypeScript', 'Cognito', 'API Gateway', 'DynamoDB', 'S3', 'AWS CDK'] },
  { id: 'smepulse', name: 'EcoStruxure SME Pulse 2.0', aliases: ['sme pulse', 'smepulse', 'ecostruxure', 'schneider', 'schneider electric', 'yuva yodha', 'esp32', 'iot project', 'iot'], one: 'His Yuva Yodha Tech 2026 build for Schneider Electric (Smart Manufacturing): retrofit machine monitoring from current, vibration and temperature (ESP32 sensor-node design, edge gateway, FastAPI + WebSocket dashboard), 382 tests passing, with simulated energy savings of 12–27% per unit. Hardware is designed but not yet field-validated.', stack: ['Python', 'FastAPI', 'ESP32', 'WebSockets'] },
  { id: 'labpulse', name: 'Lab Pulse', aliases: ['lab pulse', 'labpulse', 'lab monitoring'], one: 'Real-time lab monitoring for faculty: a live student × task grid, an in-browser editor for JS, Python, Java and C++, test cases with automatic scoring (Next.js + Firebase Realtime DB).', stack: ['Next.js', 'React', 'Firebase'] },
  { id: 'friendrec', name: 'Friend Recommendation System', aliases: ['friend recommendation', 'recommendation system', 'recommender', 'adsa'], one: 'Suggests connections using cosine similarity over interests, demographics and location plus mutual friends (Pandas, scikit-learn).', stack: ['Python', 'Pandas', 'scikit-learn'] },
  { id: 'prahaar', name: "Prahaar '26", aliases: ['prahaar', 'sports tournament', 'inter-school'], one: 'A full-stack app for the Prahaar 2026 inter-school sports tournament: React + TypeScript frontend, Node.js + Express + SQLite API.', stack: ['React', 'TypeScript', 'Express', 'SQLite'] },
  { id: 'basketball', name: 'Inter-NMIMS Basketball 2025 site', aliases: ['basketball', 'inter nmims basketball'], one: 'The tournament website with live scoring, an admin panel, timeouts, match history and 3D visuals (React + React Three Fiber).', stack: ['React', 'Three.js'] },
  { id: 'kingsukh', name: 'Kingsukh Guest House', aliases: ['kingsukh', 'guest house', 'innobyte project'], one: 'A premium responsive hospitality website he built during the InnoByte internship (HTML, CSS, JS, AOS animations, lightbox gallery).', stack: ['HTML', 'CSS', 'JavaScript'] },
  { id: 'vinyasa', name: 'Vinyasa team page', aliases: ['vinyasa site', 'team page', 'robotics club website'], one: 'The "Meet our team" site for Vinyasa, the robotics club he heads, live on GitHub Pages.', stack: ['HTML', 'CSS', 'JavaScript'] },
  {
    id: 'site',
    name: 'This portfolio',
    aliases: ['this site', 'this website', 'this portfolio', 'the website', 'the site', 'your website', 'his website', 'portfolio website'],
    one: 'A hand-built Vite site: the page is "constructed" live by a team of multiplayer cursors, then those same cursors assemble into me.',
    how: 'Plain JavaScript modules, a scroll-scrubbed video background drawn to canvas, a live build mode (frames, typing, measurements) and interactive demos of his real systems. No framework, no trackers.',
    stack: ['JavaScript', 'Vite', 'Canvas', 'CSS'],
  },
];

/* ---------- skills (with where he has used them) ---------- */
export const SKILLS = [
  { n: 'Python', a: ['python', 'py'], w: 'Face Auth, ANPR, MemoryTrack and the AI Research Agent' },
  { n: 'C++', a: ['c++', 'cpp'], w: 'his DSA and coursework' },
  { n: 'JavaScript', a: ['javascript', 'js', 'es6'], w: 'AquaFlow, the Recipe Generator frontend and this site' },
  { n: 'TypeScript', a: ['typescript', 'ts'], w: 'web projects (he lists it alongside JavaScript)' },
  { n: 'Java', a: ['java'], w: 'coursework (basics)' },
  { n: 'SQL', a: ['sql', 'mysql', 'postgres', 'postgresql', 'sqlite'], w: 'ANPR (MySQL vehicle logs), data work at Espiratia and Gudsky' },
  { n: 'React', a: ['react', 'reactjs', 'react.js'], w: 'frontend work' },
  { n: 'Next.js', a: ['nextjs', 'next.js'], w: 'Smart Hospital' },
  { n: 'Node.js', a: ['node', 'nodejs', 'node.js', 'express'], w: 'the Smart Hospital REST API' },
  { n: 'Flask / Django', a: ['flask', 'django', 'drf', 'django rest framework'], w: 'Python backends and REST APIs' },
  { n: 'REST APIs', a: ['rest api', 'rest apis', 'api', 'apis', 'api design'], w: 'Smart Hospital, the Recipe Generator and his Infosys internship' },
  { n: 'Socket.io', a: ['socket.io', 'socketio', 'websocket', 'websockets', 'sockets'], w: 'streaming webcam frames in Face Auth' },
  { n: 'JWT auth', a: ['jwt', 'auth', 'authentication', 'rbac', 'role based access'], w: 'Smart Hospital (4 roles) and the Recipe Generator (Cognito)' },
  { n: 'Tailwind CSS', a: ['tailwind', 'tailwindcss'], w: 'AquaFlow' },
  { n: 'HTML & CSS', a: ['html', 'css', 'html5', 'css3'], w: 'every web project, including this site' },
  { n: 'Vite', a: ['vite'], w: 'AquaFlow and this site' },
  { n: 'Flutter', a: ['flutter', 'dart'], w: 'Campus Voting and DayPlanner' },
  { n: 'Firebase', a: ['firebase', 'firestore'], w: 'Campus Voting and DayPlanner' },
  { n: 'MongoDB', a: ['mongodb', 'mongo', 'nosql'], w: 'Smart Hospital' },
  { n: 'DynamoDB', a: ['dynamodb', 'dynamo'], w: 'the Recipe Generator and Care_4_U' },
  { n: 'AWS Lambda', a: ['lambda', 'aws lambda', 'serverless'], w: 'the Recipe Generator (5 Lambda functions)' },
  { n: 'Amazon Bedrock', a: ['bedrock', 'amazon bedrock', 'aws bedrock'], w: 'the Recipe Generator, and his live AWS demos' },
  { n: 'API Gateway', a: ['api gateway', 'apigateway'], w: 'the Recipe Generator' },
  { n: 'Cognito', a: ['cognito'], w: 'the Recipe Generator, and his "Secure with AWS" session' },
  { n: 'S3 & CloudFront', a: ['s3', 'cloudfront', 'cdn'], w: 'the Recipe Generator, Care_4_U and this site' },
  { n: 'CloudFormation', a: ['cloudformation', 'iac', 'infrastructure as code', 'infra as code'], w: 'the whole Recipe Generator stack' },
  { n: 'CloudWatch', a: ['cloudwatch', 'monitoring', 'logging'], w: 'monitoring the Recipe Generator' },
  { n: 'EC2 & SNS', a: ['ec2', 'sns'], w: 'Care_4_U' },
  { n: 'IAM', a: ['iam'], w: 'his AWS projects' },
  { n: 'Google Cloud', a: ['gcp', 'google cloud', 'load balancing'], w: 'GCP load balancing labs' },
  { n: 'OpenCV', a: ['opencv', 'cv2', 'image processing'], w: 'Face Auth and ANPR' },
  { n: 'YOLO', a: ['yolo', 'yolov10', 'yolov10n', 'object detection'], w: 'ANPR (YOLOv10n)' },
  { n: 'ResNet-50, MTCNN & Dlib', a: ['resnet', 'resnet-50', 'resnet50', 'mtcnn', 'dlib', 'face detection'], w: 'Face Auth' },
  { n: 'FAISS', a: ['faiss', 'vector search', 'embeddings', 'vector database'], w: 'MemoryTrack (720-D vectors)' },
  { n: 'Tesseract OCR', a: ['tesseract', 'ocr'], w: 'ANPR' },
  { n: 'TensorFlow', a: ['tensorflow', 'keras', 'tf'], w: 'deep-learning work like the PlantVillage classifier' },
  { n: 'Scikit-learn', a: ['scikit-learn', 'sklearn', 'scikit'], w: 'classic ML work' },
  { n: 'Pandas & NumPy', a: ['pandas', 'numpy'], w: 'data cleaning and analysis at Gudsky and Espiratia' },
  { n: 'Matplotlib', a: ['matplotlib', 'seaborn'], w: 'data visualisation' },
  { n: 'Power BI', a: ['power bi', 'powerbi'], w: 'the Syllabus Tracker' },
  { n: 'NLP', a: ['nlp', 'natural language processing', 'summarization', 'summarisation'], w: 'his Infosys internship and the AI Research Agent' },
  { n: 'Generative AI & LLMs', a: ['genai', 'gen ai', 'generative ai', 'llm', 'llms', 'large language models', 'prompt engineering', 'prompting'], w: 'the Recipe Generator (Bedrock) and the AI Research Agent' },
  { n: 'Computer vision', a: ['computer vision'], w: 'Face Auth, ANPR and MemoryTrack' },
  { n: 'Deep learning', a: ['deep learning', 'neural networks', 'cnn', 'cnns'], w: 'Face Auth (ResNet-50) and PlantVillage' },
  { n: 'Machine learning', a: ['machine learning', 'ml'], w: 'his CV projects and coursework' },
  { n: 'Git & GitHub', a: ['git', 'github', 'version control'], w: 'every project and his internships' },
  { n: 'Agile / Scrum', a: ['agile', 'scrum'], w: 'his internships' },
  { n: 'Data structures & algorithms', a: ['dsa', 'data structures', 'algorithms', 'leetcode', 'competitive programming'], w: 'coursework and interview prep' },
  { n: 'Networking', a: ['networking', 'computer networks', 'cisco'], w: 'his Cisco Networking Basics certification and coursework' },
  { n: 'Blockchain', a: ['blockchain', 'web3'], w: 'the MedLedger / TrialLink concept' },
];

/* ---------- highlights ---------- */
export const AWARDS = [
  '**1st place**, Drone Conquest at KAUNYAK 2026 (university-wide)',
  'Raised **₹1.5L+ in sponsorships** for the KAUNYAK UG Fest, including the 24-hr NM-Hacks and Robo Wars (sponsors like Krafton / Nodwin for BGMI and Udupi Drone & Robotics)',
  '**Published a research paper** on ResearchGate (Aug 2025), and co-wrote a paper on real-time operating systems for fire-brigade emergency response in smart cities',
  '**MIRAGE** exoplanet research (team) archived on Zenodo with a DOI',
  '**Yuva Yodha Tech 2026** (Schneider Electric) entry: EcoStruxure SME Pulse 2.0',
  'Selected as an **AWS Student Builder Campus Leader & Group Leader**',
];

export const LEADERSHIP = [
  '**AWS Student Builder Campus Leader & Group Leader**: runs a 6-week cloud program on campus',
  '**Head of the Robotics Club (Vinyasa)**, NMIMS',
  '**Sports Committee Head (Impulse)**, NMIMS',
  '**Batch Representative, CodeIT** (the STME coding club), since Aug 2024',
  '**Hostel Committee Head**: coordinated welfare, accommodation and onboarding for 70+ students',
  '**Sponsorship lead, KAUNYAK UG Fest**: ₹1.5L+ raised',
];

export const CERTS = [
  'AWS Academy Graduate: Cloud Architecting (Oct 2026, 60 hours, Credly-verified)',
  'AWS Academy Graduate: Cloud Foundations (Apr 2026)',
  'AWS Academy Graduate: Machine Learning Foundations (Apr 2025)',
  'Google Cloud Computing Foundations, plus skill badges: Build a Secure Google Cloud Network and Develop Your Google Cloud Network',
  'Cisco Networking Academy: Networking Basics and Operating Systems Basics (Nov 2025)',
  'Infosys Springboard: AI Primer, Introduction to AI, Introduction to NLP, Introduction to Data Science (2025)',
]

export const PAPER = {
  title: 'The Effect of Neurocognitive Training-Based Attention Exercises on Cognitive Performance in Data Science Students',
  where: 'ResearchGate',
  when: 'August 2025',
};

export const HOBBIES = 'Robotics and drones (he won Drone Conquest and heads the Robotics Club), running campus fests, and sports (he heads the Sports Committee).';
