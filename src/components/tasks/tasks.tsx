import { FlatList, View, Dimensions } from 'react-native';

import Task from '@/components/tasks/task';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.65;
const SPACING = 10;

const data = [
  { id: 'QUACKS', task: 'Coffee with friends' },
  { id: 'KEVIN', task: 'Go sleep' },
  { id: 'QUIN', task: 'Page 3' },
];

const Tasks = () => {
  return (
    <FlatList
      data={data}
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
          <Task groupId={item.id} taskId={item.task} />
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};

export default Tasks;
