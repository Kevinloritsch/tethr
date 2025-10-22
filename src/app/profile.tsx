import { View } from 'react-native';
import { AppText } from '@/components/apptext';

export default function ProfileScreen() {
  return (
    <View className="flex-1 justify-center p-4">
      <AppText center>
        Open up <AppText bold>app/profile.tsx</AppText> to start working on your app!
      </AppText>
    </View>
  );
}
