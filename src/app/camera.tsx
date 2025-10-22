import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
} from 'react-native';
import PhotoPreview from '@/components/camera/photopreview';
import Tethr from '@/components/tethr';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0.1);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasClicked, setHasClicked] = useState(false);
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <Pressable
        onPress={requestPermission}
        className="flex-1 items-center justify-center bg-black">
        <Text className="px-6 text-center text-white">
          Tap Anywhere to Grant Permission to Use Camera
        </Text>
      </Pressable>
    );

  const toggleCameraFacing = () => setFacing((c) => (c === 'back' ? 'front' : 'back'));
  const toggleFlash = () => setFlash((c) => (c === 'off' ? 'on' : 'off'));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const normalizedScroll = Math.min(Math.max(1 - offsetX / 100, 0), 1);
    const zoomValue = normalizedScroll * 0.4;
    setZoom(zoomValue);
  };

  const getZoomLabel = () => {
    const zoomMultiplier = 0.5 + (zoom / 0.4) * 4.5;
    return `${zoomMultiplier.toFixed(1)}x`;
  };

  const handleTakePhoto = async () => {
    if (hasClicked) return;
    setHasClicked(true);
    if (cameraRef.current) {
      const takenPhoto = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        exif: false,
      });

      setPhoto(takenPhoto);
    }
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setHasClicked(false);
  };

  if (photo) return <PhotoPreview photo={photo} handleRetakePhoto={handleRetakePhoto} />;

  return (
    <View className="flex-1 justify-between bg-black py-8">
      <Tethr />

      <View className="h-[80vh] flex-1 items-center justify-center">
        <CameraView
          style={{ height: '100%', width: '95%', borderRadius: 16, overflow: 'hidden' }}
          facing={facing}
          flash={flash}
          zoom={zoom}
          ref={cameraRef}
        />

        <View className="absolute bottom-6 w-full items-center justify-center">
          <View className="flex w-4/5 flex-row justify-between py-3">
            <TouchableOpacity onPress={toggleCameraFacing} className="items-center">
              <MaterialCommunityIcons name="camera-flip-outline" size={24} color="white" />
            </TouchableOpacity>
            <View className="items-center">
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={handleScroll}
                contentOffset={{ x: 50, y: 0 }}
                contentContainerStyle={{
                  width: 400,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="h-10 w-[100px] bg-transparent">
                <View className="h-20 w-[100px] items-center justify-center"></View>
              </ScrollView>

              <View className="pointer-events-none absolute inset-0 h-10 items-center justify-center">
                <Text className="px-8 text-xl font-semibold text-white">{getZoomLabel()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleFlash}>
              <View className="text-2xl font-bold text-white">
                {flash === 'on' ? (
                  <MaterialIcons name="flash-on" size={24} color="white" />
                ) : (
                  <MaterialIcons name="flash-off" size={24} color="white" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="h-[10vh] items-center justify-center space-y-2">
        <TouchableOpacity onPress={handleTakePhoto} disabled={hasClicked}>
          <View className="items-center justify-center rounded-full">
            <MaterialIcons name="radio-button-checked" size={72} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
