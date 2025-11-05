import { FlatList, Dimensions, View } from 'react-native';

import Group from '@/components/groups/group';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.65;

// mock data, need add smth to actually get the data
const data = [
  { id: 'QUACKS', content: 'Page 1' },
  { id: 'KEVIN', content: 'Page 2' },
  { id: 'QUIN', content: 'Page 3' },
];

const Groups = () => {
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
            height: 285,
            marginHorizontal: 10,
            backgroundColor: '#3F3F3F',
            borderRadius: 10,
            padding: 20,
          }}>
          <Group groupId={item.id} />
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};

export default Groups;
