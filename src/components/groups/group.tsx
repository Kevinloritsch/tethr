import { View, Text, Image } from 'react-native';

interface GroupProps {
  group_name: string;
  photos: {
    name: string;
    publicUrl: string;
    createdAt: string;
  }[];
}

const Group = ({ group_name, photos }: GroupProps) => {
  return (
    <View className="mx-4 h-72 w-72 rounded-md bg-tethr-gray p-4">
      <Text className="mb-4 text-3xl font-bold text-white">{group_name}</Text>
      <View className="relative flex-1 items-center justify-center">
        {photos.length > 0 ? (
          <>
            {photos[2] && (
              <Image
                source={{ uri: photos[2].publicUrl }}
                className="absolute left-2 top-10 h-32 w-32 -rotate-[15deg] rounded-lg border border-black"
              />
            )}

            {photos[1] && (
              <Image
                source={{ uri: photos[1].publicUrl }}
                className="absolute left-10 top-10 h-32 w-32 -rotate-[8deg] rounded-lg border border-black"
              />
            )}

            {photos[0] && (
              <Image
                source={{ uri: photos[0].publicUrl }}
                className="absolute left-16 top-10 h-32 w-32 rounded-lg border border-black"
              />
            )}
          </>
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
