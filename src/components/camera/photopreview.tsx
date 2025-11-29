import { CameraCapturedPicture } from 'expo-camera';
import { TouchableOpacity, Image, View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { SaveFormat, useImageManipulator } from 'expo-image-manipulator';
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
  weekly,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
  group_id: string;
  group_name: string;
  task_name: string;
  weekly: boolean;
}) => {
  const [uploading, setUploading] = useState(false);
  const [correctedPhoto, setCorrectedPhoto] = useState<string>(photo.uri);
  const [processing, setProcessing] = useState(true);
  const manipulator = useImageManipulator(photo.uri);

  useEffect(() => {
    fixOrientation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fixOrientation = async () => {
    try {
      setProcessing(true);
      console.log('Photo URI:', photo.uri);
      console.log('Photo EXIF orientation:', photo.exif?.Orientation);

      let rotation = 0;

      const exifOrientation = photo.exif?.Orientation || 6;

      // Apply 180 degree fix for landscape orientations
      if (exifOrientation === 1) {
        rotation = 90;
        console.log('Applying 90 rotation for landscape');
      } else if (exifOrientation === 3) {
        rotation = 270;
        console.log('Applying 270 rotation for landscape');
      } else if (exifOrientation === 8) {
        rotation = 180;
        console.log('Applying 180° rotation for upsidedown');
      } else {
        console.log('No rotation needed for portrait');
      }

      if (rotation !== 0) {
        manipulator.rotate(rotation); // Use the hook from top level
        const imageRef = await manipulator.renderAsync();

        const result = await imageRef.saveAsync({
          compress: 0.7,
          format: SaveFormat.JPEG,
        });

        console.log('Corrected photo URI:', result.uri);
        setCorrectedPhoto(result.uri);
      } else {
        setCorrectedPhoto(photo.uri);
      }
    } catch (error) {
      console.error('Error fixing orientation:', error);
      setCorrectedPhoto(photo.uri);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      const userId = await userController.getId();
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      await completedTasksController.addTask(task_name, group_id, weekly);
      await groupController.increaseMemberScore(userId, group_id);

      storagePush.uploadImage({
        uri: correctedPhoto,
        userId: userId,
        groupId: group_id,
        taskName: task_name,
      });

      handleRetakePhoto();
      router.push('/');
    } catch (err: any) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
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
          disabled={uploading || processing}>
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
        {processing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <>
            <Image
              className="w-[95%] rounded-2xl border-2 border-tethr-gray/80"
              style={{ height: '100%', borderRadius: 16, overflow: 'hidden' }}
              source={{ uri: correctedPhoto }}
              resizeMode="cover"
            />

            <Text className="absolute left-8 top-2 w-auto items-center justify-center rounded-lg bg-tethr-gray/80 px-3 py-2 text-white">
              {task_name}
            </Text>

            {uploading && (
              <View className="absolute inset-0 items-center justify-center rounded-2xl bg-black/70">
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
          </>
        )}
      </View>

      <View className="h-[10vh] flex-row items-center justify-end pr-8">
        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading || processing}
          className="flex flex-row items-center">
          <Text className="pr-2 text-xl font-bold text-white">Post To</Text>
          <Text className="text-xl font-bold text-tethr-purple">{group_name}</Text>

          <MaterialCommunityIcons name="chevron-right" size={36} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhotoPreview;
