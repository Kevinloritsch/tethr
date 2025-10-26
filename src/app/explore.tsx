import { View, FlatList, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { photoRetrieve, PhotoSubmission } from '@/controllers/photoRetrieve';

import Tethr from '@/components/tethr';
import Fyp from '@/components/fyp';

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

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="mt-4 text-white">Loading photos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black pt-8">
      <Tethr side="left" />
      <FlatList
        data={photos}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View className="mx-auto justify-center pb-6">
            <Fyp
              publicUrl={item.publicUrl}
              taskName={item.taskName}
              userId={item.userId}
              groupId={item.groupId}
            />
          </View>
        )}
        ListHeaderComponent={
          <Text className="pb-8 text-center text-2xl font-bold text-white">Your Feed</Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          justifyContent: photos.length === 0 ? 'center' : undefined,
          alignItems: photos.length === 0 ? 'center' : undefined,
        }}
        ListEmptyComponent={
          <Text className="px-4 text-center text-white">
            No photos yet. Join a group to start completing tasks!
          </Text>
        }
      />
    </View>
  );
}
