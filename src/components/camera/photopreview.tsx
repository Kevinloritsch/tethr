import { CameraCapturedPicture } from 'expo-camera';
import { TouchableOpacity, Image, View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import Tethr from '@/components/tethr';
import { storagePush } from '@/controllers/photoUpload';
import { userController } from '@/controllers/userInfo';
import { completedTasksController } from '@/controllers/completeTask';
import { groupController } from '@/controllers/group';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PhotoPreview = ({
  photo,
  handleRetakePhoto,
  group_id,
  group_name,
  task_name,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
  group_id: string;
  group_name: string;
  task_name: string;
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      if (!photo.base64) return;

      setUploading(true);

      const userId = await userController.getId();
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      await completedTasksController.addTask(task_name, group_id);
      await groupController.increaseMemberScore(userId, group_id);

      storagePush.uploadImage({
        uri: photo.uri,
        userId: userId,
        groupId: group_id,
        taskName: task_name,
      });
      handleRetakePhoto();
      router.push('/');
    } catch (err: any) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  };

  return (
    <View className="flex-1 justify-between bg-black py-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          className="absolute right-0 top-0 h-full items-center justify-center pb-2 pr-8"
          onPress={handleRetakePhoto}
          disabled={uploading}>
          <MaterialCommunityIcons
            name="window-close"
            size={24}
            color="#000000"
            backgroundColor="#A597FF"
            className="rounded-lg px-2"
          />
        </TouchableOpacity>
      </View>

      <View className="relative h-[80vh] flex-1 items-center justify-center">
        <Image
          className="w-[95%] rounded-2xl border-2 border-tethr-gray/80"
          style={{ height: '100%', borderRadius: 16, overflow: 'hidden' }}
          source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
        />

        <Text className="absolute left-8 top-2 w-auto items-center justify-center rounded-lg bg-tethr-gray/80 px-3 py-2 text-white">
          {task_name}
        </Text>

        {uploading && (
          <View className="absolute inset-0 items-center justify-center rounded-2xl bg-black/70">
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </View>

      <View className="h-[10vh] flex-row items-center justify-end pr-8">
        <View className="flex flex-row items-center">
          <Text className="pr-2 text-xl font-bold text-white">Post To</Text>
          <Text className="text-xl font-bold text-tethr-purple">{group_name}</Text>
          <TouchableOpacity onPress={handleUpload} disabled={uploading}>
            <MaterialCommunityIcons name="chevron-right" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PhotoPreview;
