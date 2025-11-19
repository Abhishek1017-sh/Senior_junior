// Application constants

export const USER_ROLES = {
  JUNIOR: 'junior',
  SENIOR: 'senior',
  BOTH: 'both',
};

export const SESSION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const API_BASE_URL = 'http://localhost:5000/api';

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN: 'join',
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_MESSAGE: 'receiveMessage',
  MESSAGE_HISTORY: 'messageHistory',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  USERS_ONLINE: 'usersOnline',
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
};

export const SKILL_CATEGORIES = [
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'AI/ML',
  'DevOps',
  'Cloud Computing',
  'Database Design',
  'System Design',
  'Leadership',
  'Career Growth',
  'Interview Prep',
];

export const EXPERIENCE_LEVELS = [
  'Entry Level (0-2 years)',
  'Mid Level (3-5 years)',
  'Senior Level (6-10 years)',
  'Lead/Principal (10+ years)',
  'Executive/C-Suite',
];

export const AVAILABILITY_OPTIONS = [
  'Weekdays (9 AM - 5 PM)',
  'Evenings (6 PM - 10 PM)',
  'Weekends',
  'Flexible',
];

export const AVAILABILITY_PRESETS = {
  'Weekdays (9 AM - 5 PM)': { days: ['Mon','Tue','Wed','Thu','Fri'], start: '09:00', end: '17:00', label: 'Weekdays (9 AM - 5 PM)' },
  'Evenings (6 PM - 10 PM)': { days: ['Mon','Tue','Wed','Thu','Fri'], start: '18:00', end: '22:00', label: 'Evenings (6 PM - 10 PM)' },
  'Weekends': { days: ['Sat','Sun'], start: '09:00', end: '18:00', label: 'Weekends' },
  'Flexible': { days: ['Any'], start: null, end: null, label: 'Flexible' },
};

export const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export const SESSION_DURATIONS = [
  '30 minutes',
  '60 minutes',
  '90 minutes',
  '120 minutes',
];