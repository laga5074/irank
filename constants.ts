import type { KickUser } from './types';

// These values should be set in your Netlify environment variables.
// Fallback values are provided for local development.
export const KICK_CLIENT_ID = process.env.REACT_APP_KICK_CLIENT_ID || '01K6YK14KMMAXZ7QS14TA6CKGC';

// IMPORTANT: This Redirect URI must be authorized in your Kick Developer App settings.
// In Netlify, this would be set to your site's URL, e.g., 'https://kick-autohoster.netlify.app/callback'
export const KICK_REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || (window.location.origin + '/callback');

export const KICK_AUTH_URL = 'https://kick.com/oauth2/authorize';
export const KICK_TOKEN_URL = 'https://kick.com/api/v2/oauth/token'; // Simulated endpoint
export const KICK_API_BASE_URL = 'https://kick.com/api/v2'; // Simulated API base
export const KICK_SCOPES = 'read:user read:friends write:host';

// --- Mock Data for API Simulation ---

export const MOCK_LOGGED_IN_USER: KickUser = {
    id: 9001,
    username: 'KickReviewer',
    slug: 'kickreviewer',
    profile_picture: 'https://picsum.photos/seed/kickreviewer/100',
};

export const MOCK_FRIENDS: KickUser[] = [
  { id: 1, username: 'StreamerPro', slug: 'streamerpro', profile_picture: 'https://picsum.photos/seed/streamerpro/100' },
  { id: 2, username: 'GamerGoddess', slug: 'gamergoddess', profile_picture: 'https://picsum.photos/seed/gamergoddess/100' },
  { id: 3, username: 'CodeNinja', slug: 'codeninja', profile_picture: 'https://picsum.photos/seed/codeninja/100' },
  { id: 4, username: 'VarietyVixen', slug: 'varietyvixen', profile_picture: 'https://picsum.photos/seed/varietyvixen/100' },
  { id: 5, username: 'JustChattingJed', slug: 'jed', profile_picture: 'https://picsum.photos/seed/jed/100' },
  { id: 6, username: 'SpeedrunSam', slug: 'sam', profile_picture: 'https://picsum.photos/seed/sam/100' },
];

// --- App Settings ---

export const MAX_SELECTED_FRIENDS = 3;
export const ROTATION_INTERVAL_MS = 60 * 1000; // 1 minute