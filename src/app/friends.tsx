import { View } from 'react-native';
import Tethr from '@/components/tethr';
import { AppText } from '@/components/apptext';

export default function FriendsScreen() {
  return (
    <View className="flex-1 flex-col items-center py-8 bg-black">
      <Tethr side='left'/>
      <View>
        <AppText className="text-white font-bold text-4xl">
        Your Friends
      </AppText>
      <AppText>
        searchbar lmao
      </AppText>
      <AppText center className="text-white">
        Incoming
      </AppText>
      <AppText center className="text-white">
        Pending
      </AppText>
      <AppText center className="text-white">
        Friends
      </AppText>
      </View>
      
    </View>
  );
}
