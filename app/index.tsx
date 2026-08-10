// Entry route. Sends bakers straight to the Convert tab.
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/convert" />;
}
