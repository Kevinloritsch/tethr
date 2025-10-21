import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import PhotoPreview from '@/components/camera/PhotoPreview';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center">
        <Text className="pb-2.5 text-center">We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };

      const takenPhoto = await cameraRef.current.takePictureAsync(options);

      setPhoto(takenPhoto);
    }
  };

  const handleRetakePhoto = () => setPhoto(null);

  if (photo) return <PhotoPreview photo={photo} handleRetakePhoto={handleRetakePhoto} />;

  return (
    <View className="flex-1 justify-between py-8">
      <View className="h-[10vh] items-center justify-center">
        <Text className="text-2xl font-bold text-black">Tethr Logo</Text>
      </View>

      <View className="h-[80vh] flex-1 items-center justify-center">
        <CameraView
          style={{ height: '100%', width: '95%', borderRadius: 16, overflow: 'hidden' }}
          facing={facing}
          flash={flash}
          ref={cameraRef}
        />
      </View>

      <View className="h-[10vh] items-center justify-center">
        <TouchableOpacity onPress={toggleCameraFacing}>
          <Text className="text-2xl font-bold text-black">Flip Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleTakePhoto}>
          <Text className="text-2xl font-bold text-black">Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFlash}>
          <Text className="text-2xl font-bold text-black">
            {flash === 'on' ? 'Flash On' : 'Flash Off'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
