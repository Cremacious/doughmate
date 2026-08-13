// Sam drawn as your starter: the one mascot, with the starter's feed cycle mood
// translated to a face. Kept as a thin wrapper so the starter screen reads in
// its own vocabulary (StarterMood) while the drawing stays unified in Sam.
import { Sam } from '@/components/Sam';
import { emotionForMood } from '@/lib/samEmotion';
import type { StarterMood } from '@/lib/starterMood';

export interface StarterSamProps {
  mood: StarterMood;
  size?: number;
}

export function StarterSam({ mood, size = 120 }: StarterSamProps) {
  return <Sam emotion={emotionForMood(mood)} size={size} />;
}

export default StarterSam;
