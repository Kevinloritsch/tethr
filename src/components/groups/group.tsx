import { View, Text, Image } from 'react-native';

interface GroupProps {
  group_name: string;
  photos: {
    name: string;
    publicUrl: string;
    createdAt: string;
  }[];
}

//{groupId }: GroupProps
const Group = ({ group_name, photos }: GroupProps) => {
  return (
    <View className="mx-4 h-72 w-72 rounded-md bg-tethr-gray p-4">
      <Text className="text-3xl font-bold text-white">{group_name}</Text>
      <View className="flex-1 flex-row flex-wrap justify-between">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <Image
              key={photo.name}
              source={{ uri: photo.publicUrl }}
              className="mb-2 h-24 w-[48%] rounded-lg"
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white/60">No photos yet</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Group;
