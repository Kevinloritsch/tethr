import { FlatList, View, Dimensions } from 'react-native';

import Task from '@/components/tasks/task';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.65;
const SPACING = 10;

interface TaskItem {
  task_name: string;
  group_name: string;
}

interface TasksProps {
  tasks: TaskItem[];
}

const Tasks = ({ tasks }: TasksProps) => {
  return (
    <FlatList
      data={tasks}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 25,
      }}
      renderItem={({ item }) => (
        <View
          style={{
            width: ITEM_WIDTH,
            height: 200,
            marginHorizontal: SPACING,
            backgroundColor: '#3F3F3F',
            borderRadius: 10,
            padding: 20,
          }}>
          <Task groupId={item.group_name} taskId={item.task_name} />
        </View>
      )}
      keyExtractor={(item) => item.group_name + item.task_name}
    />
  );
};

export default Tasks;
