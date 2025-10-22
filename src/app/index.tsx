import { View } from 'react-native';
import { AppText } from '@/components/apptexts';

export default function IndexScreen() {
  return (
    <View className="flex-1 justify-center p-4">
      <AppText center>
        Open up <AppText bold>app/index.tsx</AppText> to start working on your app!
      </AppText>
    </View>
  );
}
