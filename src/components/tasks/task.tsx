import { View, Text } from 'react-native';

interface TaskProps {
  groupId: string;
  taskId: string;
}

const Task = ({ groupId, taskId}: TaskProps) => {
  return (
    <View className="">
      <Text className="text-3xl font-bold text-white p">{groupId}</Text>
      <Text className="text-xl text-white py-5 ">{taskId}</Text> 
      <Text className="text-xl text-white align-bottom">Complete the task ➜</Text>
    </View>
  );
};

export default Task;