export interface TalentItem {
  id: string;
  name: string;
  craft: string;
  category: "acting" | "camera" | "sound" | "editorial" | "writing" | "directing" | "stunts";
  city: string;
  country: string;
  avatar: string;
  coverImage: string;
  experienceYears: number;
  creditsCount: number;
  bio: string;
  skills: string[];
  gear?: string[];
  languages: string[];
  verified: boolean;
  featuredReelUrl: string;
  featuredReelTitle: string;
  accolades?: string;
  availability: "Available Now" | "Booked until Nov" | "Select Projects Only";
}

export interface CastingCall {
  id: string;
  title: string;
  projectType: "Feature Film" | "OTT Web Series" | "Commercial Ad" | "Indie Short" | "Music Video";
  productionHouse: string;
  director?: string;
  craft: string;
  characterName?: string;
  characterDescription: string;
  location: string;
  shootDates: string;
  payRange: string;
  deadline: string;
  isUrgent: boolean;
  matchScore?: number;
  applicantsCount: number;
  requirements: string[];
  bannerUrl: string;
  status: "open" | "shortlisting" | "closed";
}

export interface PitchDeck {
  id: string;
  title: string;
  writer: string;
  genre: string[];
  format: "Feature Film" | "Limited Series" | "Docuseries";
  logline: string;
  synopsis: string;
  estimatedBudget: string;
  status: "Script Locked" | "Lookbook Available" | "Packaging";
  attachedTalent?: string;
  ndaRequired: boolean;
  coverImage: string;
  viewsCount: number;
  inquiriesCount: number;
}

export interface FeedPost {
  id: string;
  author: {
    name: string;
    craft: string;
    avatar: string;
    company?: string;
    verified: boolean;
  };
  timestamp: string;
  type: "casting" | "showreel" | "pitch" | "bts" | "announcement";
  content: string;
  mediaUrl?: string;
  mediaType?: "video" | "image";
  tags: string[];
  likes: number;
  commentsCount: number;
  shares: number;
  isLiked?: boolean;
  actionButton?: {
    label: string;
    type: "apply" | "view_reel" | "request_pitch" | "message";
    targetId: string;
  };
}

export interface ApplicationPipelineItem {
  id: string;
  projectTitle: string;
  roleTitle: string;
  productionHouse: string;
  appliedDate: string;
  stage: "Applied" | "Under Review" | "Audition Tape Requested" | "Callback Scheduled" | "Cast";
  progressPercent: number;
  nextStepNote: string;
  meetingLink?: string;
  meetingTime?: string;
}

// ----------------- MOCK DATA -----------------

export const FEATURED_TALENT: TalentItem[] = [
  {
    id: "tal-1",
    name: "Kabir Mehra",
    craft: "Lead Actor & Voice Artist",
    category: "acting",
    city: "Mumbai",
    country: "India",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80",
    experienceYears: 8,
    creditsCount: 14,
    bio: "Method actor trained at the National School of Drama. Known for intense antagonist and layered psychological drama performances in Prime Video and Netflix thrillers.",
    skills: ["Method Acting", "Dialogue Modulation", "Unarmed Stunt Combat", "Hindustani / Urdu"],
    languages: ["Hindi", "English", "Punjabi", "Urdu"],
    verified: true,
    featuredReelUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80",
    featuredReelTitle: "Dramatic Monologue Reel (2025-2026)",
    accolades: "MAMI Film Festival Special Jury Mention (2025)",
    availability: "Available Now",
  },
  {
    id: "tal-2",
    name: "Aanya Sen",
    craft: "Director of Photography",
    category: "camera",
    city: "Bengaluru",
    country: "India",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
    experienceYears: 10,
    creditsCount: 22,
    bio: "ISC Cinematographer specializing in naturalistic lighting, anamorphic glass, and high-contrast neo-noir visual storytelling. Shot 4 independent feature films.",
    skills: ["Arri Alexa 35", "Cooke Anamorphic Lenses", "Gimbal Operatorship", "Color Grading & ACES"],
    gear: ["Arri Alexa Mini LF Package", "Cooke Anamorphic /i 32mm-100mm", "SmallHD Cine 7"],
    languages: ["English", "Bengali", "Hindi"],
    verified: true,
    featuredReelUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000&auto=format&fit=crop&q=80",
    featuredReelTitle: "Anamorphic Cinematography Showcase",
    accolades: "Asian Film Awards Nominee — Best Cinematography",
    availability: "Booked until Nov",
  },
  {
    id: "tal-3",
    name: "Devrath Banerjee",
    craft: "Sound Designer & Re-Recording Mixer",
    category: "sound",
    city: "Mumbai",
    country: "India",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80",
    experienceYears: 12,
    creditsCount: 35,
    bio: "CAS member with 12+ years shaping immersive Dolby Atmos soundscapes for crime series, documentaries, and international festival features.",
    skills: ["Dolby Atmos Mastering", "Location Foley Capture", "Pro Tools HDX", "Dialogue Cleanup & ADR"],
    gear: ["Sound Devices 833 Scorpio", "Schoeps CMIT 5U", "Neumann KH 7.1.4 Monitoring"],
    languages: ["English", "Hindi", "Bengali"],
    verified: true,
    featuredReelUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80",
    featuredReelTitle: "Dolby Atmos Spatial Sound Design Reel",
    accolades: "National Film Award — Best Audiography (2024)",
    availability: "Available Now",
  },
  {
    id: "tal-4",
    name: "Meera Krishnan",
    craft: "Senior Film Editor",
    category: "editorial",
    city: "Chennai",
    country: "India",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80",
    experienceYears: 7,
    creditsCount: 18,
    bio: "Pacing architect for non-linear storytelling, high-stakes thriller sequences, and documentary narratives. Avid certified media composer.",
    skills: ["Avid Media Composer", "DaVinci Resolve Studio", "Long-form Pacing", "Multi-cam Sync"],
    languages: ["Tamil", "English", "Malayalam"],
    verified: true,
    featuredReelUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1000&auto=format&fit=crop&q=80",
    featuredReelTitle: "Thriller Rhythmic Montage Reel",
    accolades: "Kerala State Film Award Nominee",
    availability: "Select Projects Only",
  },
  {
    id: "tal-5",
    name: "Zoya Siddiqui",
    craft: "Screenwriter & Script Doctor",
    category: "writing",
    city: "Delhi",
    country: "India",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80",
    experienceYears: 9,
    creditsCount: 11,
    bio: "Specializing in character-driven psychological crime, authentic socio-political world-building, and sharp dialogue for OTT formats.",
    skills: ["Series Bible Creation", "Dialogue Polishing", "Beat Sheet Engineering", "Writers Room Lead"],
    languages: ["Hindi", "Urdu", "English"],
    verified: true,
    featuredReelUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80",
    featuredReelTitle: "Published Pilot Scripts & Bibles",
    accolades: "Sundance Screenwriters Lab Finalist",
    availability: "Available Now",
  },
  {
    id: "tal-6",
    name: "Vikram Rathore",
    craft: "Stunt Director & Action Choreographer",
    category: "stunts",
    city: "Mumbai",
    country: "India",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1200&auto=format&fit=crop&q=80",
    experienceYears: 14,
    creditsCount: 42,
    bio: "Designing visceral, realistic combat and high-wire action sequences. Trained in Krav Maga and martial arts choreography with strict on-set safety protocols.",
    skills: ["Hand-to-Hand Combat", "Wirework Rigging", "Vehicle Stunt Planning", "Actor Safety Training"],
    languages: ["Hindi", "English", "Marathi"],
    verified: true,
    featuredReelUrl: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1000&auto=format&fit=crop&q=80",
    featuredReelTitle: "High-Octane Combat Coordination Reel",
    accolades: "Filmfare Award — Best Action Choreography (2023)",
    availability: "Available Now",
  },
];

export const OPEN_CASTINGS: CastingCall[] = [
  {
    id: "cast-101",
    title: "Lead Antagonist (Vikram) — OTT Psychological Thriller",
    projectType: "OTT Web Series",
    productionHouse: "Dharma Productions / Netflix",
    director: "Vikramaditya Motwane",
    craft: "Actor",
    characterName: "Vikram 'The Strategist'",
    characterDescription: "Age 30-40. Intense, charismatic corporate mastermind involved in an illicit financial syndicate. Requires high emotional nuance and sharp Hindi dialogue delivery with restrained body language.",
    location: "Mumbai & Manali",
    shootDates: "Dec 15, 2026 – March 20, 2027",
    payRange: "₹14,00,000 – ₹20,00,000",
    deadline: "Nov 10, 2026",
    isUrgent: true,
    matchScore: 98,
    applicantsCount: 84,
    requirements: [
      "2-minute dramatic monologue video (Urdu/Hindi dialect)",
      "2 recent studio headshots (Neutral + Angry expression)",
      "Must have prior theatrical or camera credit",
    ],
    bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80",
    status: "open",
  },
  {
    id: "cast-102",
    title: "Chief Cinematographer (1st AC & DP Team) — Period Drama Feature",
    projectType: "Feature Film",
    productionHouse: "Excel Entertainment",
    director: "Reema Kagti",
    craft: "Director of Photography",
    characterDescription: "Shooting a 1940s historical period feature in Rajasthan. Seeking a visionary DP experienced in low-light candle choreography, vintage glass, and Arri anamorphic sensors.",
    location: "Jaipur, Rajasthan & Mumbai Studios",
    shootDates: "Jan 5, 2027 – April 30, 2027",
    payRange: "₹25,00,000 – ₹35,00,000",
    deadline: "Nov 15, 2026",
    isUrgent: false,
    matchScore: 94,
    applicantsCount: 29,
    requirements: [
      "Lookbook / Showreel with low-key period lighting",
      "Experience leading 25+ member camera crew",
      "Comfortable with harsh desert location conditions",
    ],
    bannerUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80",
    status: "open",
  },
  {
    id: "cast-103",
    title: "Female Detective (Inspector Rhea) — Crime Noir Mini-Series",
    projectType: "OTT Web Series",
    productionHouse: "Roy Kapur Films / Prime Video",
    director: "Abhishek Chaubey",
    craft: "Actor",
    characterName: "Inspector Rhea",
    characterDescription: "Age 28-36. Hardened homicide investigator confronting deep departmental corruption. Requires athletic conditioning, high stamina, and fluent conversational Marathi/Hindi.",
    location: "Mumbai (South & Port Trust area)",
    shootDates: "Nov 28, 2026 – Feb 15, 2027",
    payRange: "₹10,00,000 – ₹16,00,000",
    deadline: "Nov 05, 2026",
    isUrgent: true,
    matchScore: 89,
    applicantsCount: 112,
    requirements: [
      "Cold-read audition tape with scene sides provided",
      "Physical stunt agility check video",
      "Full body portrait and unedited polaroids",
    ],
    bannerUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1000&auto=format&fit=crop&q=80",
    status: "open",
  },
  {
    id: "cast-104",
    title: "Sound Designer & Location Recordist — Himalayan Wilderness Documentary",
    projectType: "Indie Short",
    productionHouse: "BBC Earth / Wild Cinema Lab",
    director: "Karan Oberoi",
    craft: "Sound Designer & Audio Engineer",
    characterDescription: "High-altitude expedition documentary capturing rare snow leopard movements in Spiti Valley. Requires specialized sub-zero field audio gear and spatial 3D audio mics.",
    location: "Kaza & Spiti Valley, Himachal Pradesh",
    shootDates: "Dec 10, 2026 – Jan 10, 2027",
    payRange: "₹6,00,000 + All High-Altitude Expenses",
    deadline: "Nov 20, 2026",
    isUrgent: false,
    matchScore: 82,
    applicantsCount: 19,
    requirements: [
      "Sub-zero extreme environment audio portfolio",
      "Sound Devices or Zaxcom field recorder ownership",
      "High altitude medical fitness clearance",
    ],
    bannerUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80",
    status: "open",
  },
];

export const PITCH_DECKS: PitchDeck[] = [
  {
    id: "pitch-201",
    title: "The Silent Monsoon",
    writer: "Zoya Siddiqui",
    genre: ["Psychological Thriller", "Noir", "Drama"],
    format: "Feature Film",
    logline: "When a blind acoustic forensics analyst in Mumbai overhears a murder blueprint encoded within audio ambient noise, she must team up with a disgraced ex-cop before the rains wash away the only trace.",
    synopsis: "Set during Mumbai's relentless July deluge, the story explores isolation, sensory deception, and corporate real estate murders. Script is fully written with 3 drafts complete. Attached director is National Award winner.",
    estimatedBudget: "₹6.5 Crore",
    status: "Script Locked",
    attachedTalent: "Director: Anurag S. (Attached)",
    ndaRequired: true,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80",
    viewsCount: 342,
    inquiriesCount: 18,
  },
  {
    id: "pitch-202",
    title: "Neon Varanasi: Echoes of 2049",
    writer: "Arjun Singhal & Priya Nair",
    genre: ["Sci-Fi", "Cyberpunk", "Philosophical Drama"],
    format: "Limited Series",
    logline: "In a neon-drenched retro-futuristic Varanasi, a rogue bio-hacker discovers that uploaded memories in the sacred cloud are being wiped to rewrite Indian dynasty history.",
    synopsis: "A high-concept visual spectacle blending ancient mythology, Ghat ceremonies, and cybernetic transhumanism. Lookbook and concept art created by veteran VFX artists.",
    estimatedBudget: "₹24 Crore (8 Episodes)",
    status: "Lookbook Available",
    ndaRequired: true,
    coverImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1000&auto=format&fit=crop&q=80",
    viewsCount: 680,
    inquiriesCount: 32,
  },
  {
    id: "pitch-203",
    title: "Deccan Iron: The Bandit Queen's Code",
    writer: "Ranganathan K.",
    genre: ["Period Action", "Western", "Historical"],
    format: "Feature Film",
    logline: "1882 Southern India: A renegade locomotive engineer forms an alliance with a legendary forest rebellion leader to hijack British gold destined for Victorian war efforts.",
    synopsis: "Raw, kinetic action in the vein of 'The Good, The Bad and The Ugly' transposed into the rugged terrain of the Deccan plateau.",
    estimatedBudget: "₹18 Crore",
    status: "Packaging",
    ndaRequired: true,
    coverImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1000&auto=format&fit=crop&q=80",
    viewsCount: 420,
    inquiriesCount: 14,
  },
];

export const HOME_FEED_POSTS: FeedPost[] = [
  {
    id: "feed-1",
    author: {
      name: "Dharma Casting Network",
      craft: "Casting Directorate",
      company: "Dharma Productions",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      verified: true,
    },
    timestamp: "18m ago",
    type: "casting",
    content: "🚨 URGENT CASTING NOTICE for Netflix OTT Series 'Shadow of Verity'. We are auditioning for the role of 'Vikram' (Male, 32-40, Hindi/Urdu dialect). Character is suave, menacing, and emotionally unpredictable. Tap below to submit your self-tape directly through CineConnect's secure portal.",
    tags: ["#CastingCall", "#NetflixSeries", "#DharmaProductions", "#ActorsLife"],
    likes: 142,
    commentsCount: 38,
    shares: 24,
    isLiked: false,
  },
  {
    id: "feed-2",
    author: {
      name: "Aanya Sen, ISC",
      craft: "Director of Photography",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      verified: true,
    },
    timestamp: "2h ago",
    type: "showreel",
    content: "Fresh camera test frames from our night shoot in Fort Kochi using the Arri Alexa 35 paired with vintage 1970s Kowa Anamorphic primes. No artificial fill—just available sodium vapor lamps and wet cobblestones. What do you think of the color separation?",
    mediaUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80",
    mediaType: "image",
    tags: ["#Cinematography", "#ArriAlexa35", "#Anamorphic", "#FilmLighting"],
    likes: 312,
    commentsCount: 47,
    shares: 19,
    isLiked: true,
  },
  {
    id: "feed-3",
    author: {
      name: "Zoya Siddiqui",
      craft: "Screenwriter",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
      verified: true,
    },
    timestamp: "4h ago",
    type: "pitch",
    content: "Honored to announce our feature screenplay 'The Silent Monsoon' has been selected for the CineConnect Curated Pitch Showcase! We have our National Award-winning director attached and are currently entertaining co-production conversations. Verified producers can review our script treatment below.",
    mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80",
    mediaType: "image",
    tags: ["#Screenwriting", "#PitchDeck", "#FilmFunding", "#IndieCinema"],
    likes: 189,
    commentsCount: 22,
    shares: 15,
    isLiked: false,
  },
  {
    id: "feed-4",
    author: {
      name: "Roy Kapur Films",
      craft: "Production Studio",
      avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      verified: true,
    },
    timestamp: "7h ago",
    type: "announcement",
    content: "Wrap day on Schedule 1 of 'Manali Noir'! A huge shoutout to the CineConnect platform where our casting department sourced 6 principal character actors and our B-unit DP within 72 hours of posting. The talent pool on this platform is unmatched.",
    mediaUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1000&auto=format&fit=crop&q=80",
    mediaType: "image",
    tags: ["#WrapDay", "#ProductionUpdate", "#CastingSuccess", "#Bollywood"],
    likes: 428,
    commentsCount: 56,
    shares: 33,
    isLiked: false,
  },
];

export const MY_APPLICATIONS: ApplicationPipelineItem[] = [
  {
    id: "app-1",
    projectTitle: "Shadow of Verity (Netflix)",
    roleTitle: "Lead Antagonist (Vikram)",
    productionHouse: "Dharma Productions",
    appliedDate: "Oct 12, 2026",
    stage: "Callback Scheduled",
    progressPercent: 75,
    nextStepNote: "Studio Screen Test & Chemistry Read with Director Vikramaditya Motwane",
    meetingTime: "Oct 24, 2026 • 03:00 PM IST",
    meetingLink: "https://meet.google.com/cin-dhar-vkm",
  },
  {
    id: "app-2",
    projectTitle: "Manali Noir (Amazon Prime)",
    roleTitle: "DSP Harshavardhan",
    productionHouse: "Roy Kapur Films",
    appliedDate: "Oct 08, 2026",
    stage: "Under Review",
    progressPercent: 40,
    nextStepNote: "Self-tape monologue submitted. Casting associate currently reviewing shortlisted batch.",
  },
  {
    id: "app-3",
    projectTitle: "Tata Safari Commercial Campaign",
    roleTitle: "Narrator & Adventurer",
    productionHouse: "Ogilvy & Mather",
    appliedDate: "Oct 02, 2026",
    stage: "Audition Tape Requested",
    progressPercent: 50,
    nextStepNote: "Requested 45-second high-energy voice sample using script sides attached.",
  },
];

export const TESTIMONIALS = [
  {
    quote: "CineConnect completely redefined our casting workflow. We cast 8 principal characters and hired our second-unit camera crew for an OTT series in under a week. The verified credentials and showreel player are game changers.",
    author: "Shanoo Sharma",
    role: "Head of Casting, Yash Raj Films",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    project: "Cast 12 Feature Projects",
  },
  {
    quote: "As an independent cinematographer, finding authentic directors without navigating agent gatekeepers was impossible. Through CineConnect, I signed on to shoot two festival features in 2026.",
    author: "Aanya Sen, ISC",
    role: "Independent Cinematographer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    project: "Shot 4 Feature Films",
  },
  {
    quote: "The pitch marketplace gave our screenplay the exact institutional visibility we needed while protecting our intellectual property with dynamic watermarking. We secured co-production funding within 3 weeks.",
    author: "Arjun Singhal",
    role: "Screenwriter & Showrunner",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    project: "Funded via CineConnect Vault",
  },
];

export const FAQS = [
  {
    q: "How does CineConnect verify actors, cinematographers, and crew?",
    a: "Every creative professional profile undergoes a multi-step verification process: phone & email authentication, government ID verification (Aadhaar/Passport/Driving License), and automated cross-referencing with verified filmography credits (IMDb, theatrical releases, OTT credits). Verified talent receive the CineConnect Golden Film Clapper badge.",
  },
  {
    q: "How are screenplays and pitch decks protected against unauthorized leakage?",
    a: "Every pitch document uploaded to the Pitch Vault is stored in encrypted AWS S3 buckets. When an executive or producer requests access, they must sign a legally binding digital NDA. Each page is dynamically watermarked with the viewer's full name, email, IP address, and viewing timestamp to prevent leaks.",
  },
  {
    q: "How does the AI Talent Recommendation Engine work?",
    a: "CineConnect uses pgvector high-dimensional cosine similarity embeddings (768 dimensions) to match talent profiles with casting breakdowns. The engine analyzes craft proficiency, dialect fluency, age brackets, prior role types, and travel availability to rank the top 5% most qualified candidates instantly.",
  },
  {
    q: "Is CineConnect free for creative talent?",
    a: "Yes! Creating your talent profile, uploading showreels, and applying to open casting calls is 100% free for artists. Production houses and casting directors subscribe to verified casting workspace tools and bulk audition management pipelines.",
  },
  {
    q: "What video formats are supported for self-tapes and showreels?",
    a: "CineConnect supports MP4, MOV, and ProRes up to 4K resolution. Videos are automatically transcoded and distributed via high-speed CloudFront CDN with multi-bitrate streaming so casting directors can review auditions on mobile and desktop without lag.",
  },
];
