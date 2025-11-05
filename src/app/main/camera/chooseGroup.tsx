import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';
import Tethr from '@/components/tethr';

const ChooseGroup = () => {
  return (
    <View className="flex-1 flex-col bg-black pt-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
      </View>
      <View className="items-center">
        <Text className="text-xl text-white">Select Group</Text>
        <Link href="/main/camera/chooseTask" asChild>
          <Button title="Choose Task" />
        </Link>
      </View>
    </View>
  );
};

export default ChooseGroup;
