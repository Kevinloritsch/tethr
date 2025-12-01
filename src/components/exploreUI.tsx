import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useState, useEffect, useMemo, useRef } from 'react';
import { photoRetrieve, PhotoSubmission } from '@/controllers/photoRetrieve';
import { groupController } from '@/controllers/group';
import {
  registerExploreObserver,
  unregisterExploreObserver,
} from '@/controllers/observers/uiObservers';

import Tethr from '@/components/tethr';
import Fyp from '@/components/fyp';
import SearchBar from '@/components/searchbar';
import Entypo from '@expo/vector-icons/Entypo';
interface PhotoWithGroup extends PhotoSubmission {
  groupName: string;
}

export default function ExploreUI() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [photos, setPhotos] = useState<PhotoWithGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const groupsMapRef = useRef<Record<string, string>>({});
  const flatListRef = useRef<FlatList>(null);

  const loadPhotos = async () => {
    try {
      setLoading(true);

      const allGroups = await groupController.fetchUserData('EXPLORE_SCREEN');
      const groupIds = allGroups.map((g) => g.group_id);

      const gMap: Record<string, string> = {};
      allGroups.forEach((g) => {
        gMap[g.group_id] = g.group_name;
      });
      groupsMapRef.current = gMap;

      if (groupIds.length > 0) {
        const allPhotos = await photoRetrieve.getPhotosByGroups(groupIds);
        const photosWithGroupNames = allPhotos.map((photo) => {
          const group = allGroups.find((g) => g.group_id === photo.groupId);
          return {
            ...photo,
            groupName: group?.group_name || 'Unknown Group',
          };
        });
        setPhotos(photosWithGroupNames);
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useEffect(() => {
    loadPhotos();

    registerExploreObserver((data) => {
      console.log('Explore: Observer, adding photos to relevant states...', data);

      const newPhoto: PhotoWithGroup = {
        name: data.photoUri.split('/').pop() || '',
        publicUrl: data.photoUri,
        createdAt: data.timestamp,
        groupId: data.groupId,
        userId: data.userId,
        username: 'You',
        taskName: data.taskName,
        groupName: groupsMapRef.current[data.groupId] || 'Unknown Group',
      };

      setPhotos((prev) => [newPhoto, ...prev]);
    });

    return () => unregisterExploreObserver();
  }, []);

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return photos;

    const lowerQuery = searchQuery.toLowerCase();
    return photos.filter(
      (photo) =>
        photo.groupName.toLowerCase().includes(lowerQuery) ||
        photo.taskName.toLowerCase().includes(lowerQuery) ||
        photo.username.toLowerCase().includes(lowerQuery)
    );
  }, [photos, searchQuery]);

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
        ref={flatListRef}
        data={filteredPhotos}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => {
          return (
            <View className="mx-auto justify-center pb-6">
              <Fyp
                publicUrl={item.publicUrl}
                taskName={item.taskName}
                userId={item.username}
                groupId={item.groupName}
              />
            </View>
          );
        }}
        ListHeaderComponent={
          <View className="mx-auto flex flex-col justify-center pb-8">
            <Text className="pb-4 text-center text-2xl font-bold text-white">Your Feed</Text>
            <SearchBar placeholder="Search for..." onSearch={setSearchQuery} value={searchQuery} />
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          justifyContent: photos.length === 0 ? 'center' : undefined,
          alignItems: photos.length === 0 ? 'center' : undefined,
          paddingBottom: 80,
        }}
        ListEmptyComponent={
          <Text className="px-4 text-center text-white">
            {searchQuery
              ? 'No photos match your search.'
              : 'No photos yet. Join a group to start completing tasks!'}
          </Text>
        }
      />

      <TouchableOpacity
        onPress={scrollToTop}
        className="absolute bottom-24 right-6 mb-4 h-10 w-14 items-center justify-center rounded-full bg-tethr-purple">
        <Entypo name="chevron-up" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
