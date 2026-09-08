// The stack does not animate. Sliding the whole screen also slides the butter
// canvas, which is the one thing that does not change between steps, so the screen
// appears to move while nothing on it does. OnboardingScaffold animates its own
// content instead: hero, text and footer, 40ms apart.
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
