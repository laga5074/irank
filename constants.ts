
import type { Friend } from './types';

export const ALL_FRIENDS: Friend[] = [
  { id: 1, name: 'StreamerPro', avatarUrl: 'https://picsum.photos/seed/streamerpro/100' },
  { id: 2, name: 'GamerGoddess', avatarUrl: 'https://picsum.photos/seed/gamergoddess/100' },
  { id: 3, name: 'CodeNinja', avatarUrl: 'https://picsum.photos/seed/codeninja/100' },
  { id: 4, name: 'VarietyVixen', avatarUrl: 'https://picsum.photos/seed/varietyvixen/100' },
  { id: 5, name: 'JustChattingJed', avatarUrl: 'https://picsum.photos/seed/jed/100' },
  { id: 6, name: 'SpeedrunSam', avatarUrl: 'https://picsum.photos/seed/sam/100' },
];

export const MAX_SELECTED_FRIENDS = 3;
export const ROTATION_INTERVAL_MS = 60 * 1000; // 1 minute
