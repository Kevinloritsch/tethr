import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Tethr from '@/components/tethr';

import Entypo from '@expo/vector-icons/Entypo';

const ChooseTask = () => {
  const { group_name } = useLocalSearchParams();
  const { group_id } = useLocalSearchParams();
  console.log(group_name);
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
        <Text className="text-2xl font-bold text-white">Select Task for {group_name}</Text>
        {/* <Link href="/main/camera/takePhoto" asChild>
          <Button title="Take Photo" />
        </Link> */}
        <Pressable
          className="mr-3 rounded-xl bg-blue-500 px-4 py-2"
          onPress={() =>
            router.push({
              pathname: '/main/camera/takePhoto',
              params: { group_name: group_name, group_id: group_id },
            })
          }></Pressable>
      </View>
    </View>
  );
};

export default ChooseTask;
