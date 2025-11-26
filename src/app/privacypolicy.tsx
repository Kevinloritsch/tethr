import { View, Text, TouchableOpacity } from 'react-native';
import Tethr from '@/components/tethr';
import { useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <View className="w-full flex-1 flex-col bg-black pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          className="absolute left-0 top-0 h-full items-center justify-center pb-2 pl-8"
          onPress={() => {
            router.push('/main/profile');
          }}>
          <Entypo
            name="chevron-left"
            size={24}
            color="#000000"
            backgroundColor="#A597FF"
            className="rounded-lg px-2"
          />
        </TouchableOpacity>
      </View>
      <View className="w-full items-center">
        <Text className="mx-4 mb-4 mt-8 text-center text-2xl font-bold text-white">
          Privacy Policy
        </Text>
        <Text className="w-11/12 text-white">
          Your data is NOT secure, we WILL sell your data because we are BROKE and we NEED MONEY.
          Thank you for understanding!
        </Text>
      </View>
    </View>
  );
}
