import { View, Text, Button, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import Tethr from '@/components/tethr';

import Entypo from '@expo/vector-icons/Entypo';

const ChooseTask = () => {
  return (
    <View className="flex-1 flex-col bg-black pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-0 top-0 h-full items-center justify-center pb-2 pl-8">
          <Entypo
            name="chevron-left"
            size={24}
            color="#000000"
            backgroundColor="#A597FF"
            className="rounded-lg px-2"
          />
        </TouchableOpacity>
      </View>
      <View className="items-center">
        <Text className="text-xl text-white">Select Task</Text>
        <Link href="/main/camera/takePhoto" asChild>
          <Button title="Take Photo" />
        </Link>
      </View>
    </View>
  );
};

export default ChooseTask;
