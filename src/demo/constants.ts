import type { User } from '@/store/auth-store';

export const DEMO_EMAIL = 'demo@surespot.app';
export const DEMO_PASSWORD = 'demo1234';

export const DEMO_RIDER_ID = 'demo-rider-001';
export const DEMO_CUSTOMER_ID = 'demo-customer-001';

export const DEMO_USER: User = {
  id: DEMO_RIDER_ID,
  firstName: 'Demo',
  lastName: 'Rider',
  phone: '+2349012345678',
  email: DEMO_EMAIL,
  avatar: null,
};

export const BOT_REPLIES = [
  "Thanks! I'll be waiting.",
  'Great, see you soon!',
  'Okay, noted. Thank you.',
  'Perfect, on my way.',
  'Sounds good, appreciated!',
  'Got it. Thank you so much!',
  'Please be careful with the package.',
  'Alright, I appreciate the update.',
  "I'm at the gate, just let me know.",
  'No rush, take your time.',
];

export const DEMO_PICKUP_NAMES = [
  'Chicken Republic',
  'Sweet Sensation',
  'KFC Ikeja',
  'Dominos Pizza',
  'Mr Biggs',
];

export const DEMO_STREET_NAMES = [
  'Admiralty Way, Lekki Phase 1',
  'Adeola Odeku Street, Victoria Island',
  'Isaac John Street, GRA Ikeja',
  'Awolowo Road, Ikoyi',
  'Opebi Road, Ikeja',
  'Allen Avenue, Ikeja',
  'Broad Street, Lagos Island',
  'Bode Thomas Street, Surulere',
  'Toyin Street, Ikeja',
  'Obafemi Awolowo Way, Ikeja',
];
