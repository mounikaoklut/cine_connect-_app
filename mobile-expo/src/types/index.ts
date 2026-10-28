export type ScreenKey =
  | 'Home'
  | 'Opportunities'
  | 'Messages'
  | 'Notifications'
  | 'Profile'
  | 'Settings'
  | 'Applications'
  | 'Portfolio';

export interface MessageThread {
  id: string;
  sender: string;
  role: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  projectContext?: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'other';
    text: string;
    time: string;
  }>;
}

export interface NotificationItem {
  id: string;
  type: 'callback' | 'match' | 'review' | 'nda';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  urgent?: boolean;
}

export interface StudioPost {
  id: string;
  author: {
    name: string;
    studio: string;
    avatar: string;
    verified: boolean;
  };
  timestamp: string;
  type: 'announcement' | 'casting_call' | 'pitch_package' | 'bts';
  headline: string;
  content: string;
  mediaUrl?: string;
  badgeLabel?: string;
  projectBudget?: string;
  actionButton?: {
    label: string;
    type: 'pitch' | 'audition' | 'contact';
  };
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
}

export interface ProductionOpportunity {
  id: string;
  title: string;
  productionCompany: string;
  logo: string;
  director?: string;
  compensation: string;
  location: string;
  shootDates: string;
  category: 'Directing' | 'Cinematography' | 'Post-Production' | 'Writing' | 'Acting';
  requirements: string[];
  matchScore: number;
  urgent?: boolean;
  bookmarked?: boolean;
  postedAgo: string;
}

export interface ProductionApplication {
  id: string;
  projectTitle: string;
  roleTitle: string;
  productionHouse: string;
  logo: string;
  appliedDate: string;
  stage: 'Submitted' | 'Under Review' | 'Audition/Interview' | 'Archived';
  currentStepIndex: number; // 0: Submitted, 1: Under Review, 2: Audition/Interview, 3: Completed
  producerContact: {
    name: string;
    title: string;
    avatar: string;
  };
  nextStepNote: string;
  hearingDate?: string;
}

export interface FilmCredit {
  id: string;
  title: string;
  role: string;
  year: string;
  directorOrHouse: string;
  platformOrFestival: string;
}

export interface PitchDeckItem {
  id: string;
  title: string;
  genre: string;
  format: string; // Feature Film | Web Series | Short
  logline: string;
  budgetEstimate: string;
  coverImage: string;
  writer: string;
  watermarkProtected: boolean;
}

export interface CreatorShowreel {
  title: string;
  duration: string;
  aspectRatio: string; // 2.39:1 Anamorphic
  resolution: string; // 4K DCI
  cameraPackage: string; // Arri Alexa 35 & Cooke Anamorphic / LF
  timecode: string;
  thumbnail: string;
}

export interface CreatorProfile {
  name: string;
  handle: string;
  headline: string;
  location: string;
  avatar: string;
  verified: boolean;
  dpdpVerified: boolean;
  unionBadges: string[]; // ['WICA - Western India Cinematographers', 'SWA - Screenwriters Association']
  bio: string;
  completeness: number;
  creditsCount: number;
  awardsCount: number;
  equipment: string[];
  credits: FilmCredit[];
  showreel: CreatorShowreel;
  representation: {
    agency: string;
    agentName: string;
    email: string;
    phone: string;
  };
}
