import { View, Image, FlatList, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { photoRetrieve, PhotoSubmission } from '@/controllers/photoRetrieve';

export default function ExploreScreen() {
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const allPhotos = await photoRetrieve.getAllPhotos();
    const validPhotos = allPhotos.filter((photo) => photo.name && photo.publicUrl).slice(0, -1);
    setPhotos(validPhotos);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading photos...</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-4">
        <Text className="text-center text-white">No photos yet. Upload your first one!</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black pt-12">
      <FlatList
        data={photos}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View className="mb-6 px-4">
            <Image
              source={{ uri: item.publicUrl }}
              className="w-full rounded-2xl"
              style={{ aspectRatio: 3 / 4, height: undefined }}
              resizeMode="cover"
            />
            <View className="mt-2 px-2">
              <Text className="text-lg font-bold text-white">Task: {item.taskName}</Text>
              <Text className="text-sm text-gray-400">
                User: {item.userId} • Group: {item.groupId}
              </Text>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
            progressBackgroundColor="#000000"
            title={'Refreshing...'}
            titleColor="#FFFFFF"
          />
        }
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
      />
    </View>
  );
}
