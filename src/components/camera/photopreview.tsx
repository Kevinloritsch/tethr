import { CameraCapturedPicture } from 'expo-camera';
import { TouchableOpacity, Image, View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import Tethr from '@/components/tethr';
import { storagePush } from '@/controllers/photoUpload';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const PhotoPreview = ({
  photo,
  handleRetakePhoto,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      if (!photo.base64) return;

      setUploading(true);

      storagePush.uploadImage({
        base64Data: photo.base64,
        userId: 'Kevin',
        groupId: 'QUACKS',
        taskName: 'Selfie',
      });

      handleRetakePhoto();
      router.replace('/');
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
          className="border-tethr-gray w-[95%] rounded-2xl border-2"
          style={{ height: '100%', borderRadius: 16, overflow: 'hidden' }}
          source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
        />

        <Text className="bg-tethr-gray absolute left-8 top-2 w-auto items-center justify-center rounded-lg px-3 py-2 text-white">
          TaskName
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
          <Text className="text-xl font-bold text-tethr-purple">GroupName</Text>
          <TouchableOpacity onPress={handleUpload} disabled={uploading}>
            <MaterialCommunityIcons name="chevron-right" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PhotoPreview;
