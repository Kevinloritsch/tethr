import { Fontisto } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import { TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import Tethr from '@/components/tethr';
import { storagePush } from '@/controllers/photoUpload';

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
      <Tethr />

      <View className="h-[80vh] flex-1 items-center justify-center">
        <Image
          className="w-[95%] rounded-2xl"
          style={{ height: '100%', borderRadius: 16, overflow: 'hidden' }}
          source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
        />

        {uploading && (
          <View className="absolute inset-0 items-center justify-center rounded-2xl bg-black/70">
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </View>

      <View className="h-[10vh] flex-row items-center justify-evenly">
        <TouchableOpacity onPress={handleRetakePhoto} disabled={uploading}>
          <Fontisto name="trash" size={36} color={uploading ? 'gray' : 'white'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleUpload} disabled={uploading}>
          <Fontisto name="error" size={36} color={uploading ? 'gray' : 'white'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhotoPreview;
