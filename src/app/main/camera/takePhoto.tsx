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
import { router, useLocalSearchParams } from 'expo-router';
import PhotoPreview from '@/components/camera/photopreview';
import Tethr from '@/components/tethr';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';

export default function Camera() {
  const { group_name } = useLocalSearchParams();
  const groupName = Array.isArray(group_name) ? group_name[0] : (group_name ?? '');

  const { group_id } = useLocalSearchParams();
  const groupId = Array.isArray(group_id) ? group_id[0] : (group_id ?? '');

  const { task_name } = useLocalSearchParams();
  const taskName = Array.isArray(task_name) ? task_name[0] : (task_name ?? '');

  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0);
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

  const toggleCameraFacing = () => {
    if (facing === 'back') {
      setFacing('front');
      setZoom(0);
    } else {
      setFacing('back');
      setZoom(0.045);
    }
  };
  const toggleFlash = () => setFlash((c) => (c === 'off' ? 'on' : 'off'));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const normalizedScroll = Math.min(Math.max(1 - offsetX / 100, 0), 1);
    const zoomValue = normalizedScroll * 0.4;
    console.log(zoomValue);
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
        exif: true,
      });

      setPhoto(takenPhoto);
    }
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setHasClicked(false);
  };

  if (photo)
    return (
      <PhotoPreview
        photo={photo}
        handleRetakePhoto={handleRetakePhoto}
        group_name={groupName}
        group_id={groupId}
        task_name={taskName}
      />
    );

  return (
    <View className="flex-1 justify-between bg-black py-8">
      <View className="relative h-[10vh] w-full items-center">
        <View className="absolute left-0 right-0 top-0 items-center">
          <Tethr side="center" />
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-0 top-0 h-full items-center justify-center pb-2 pl-8">
          <Entypo
            name="chevron-left"
            size={24}
            color="#000000"
            backgroundColor="#A597FF"
            className="rounded-lg px-2"
          />
        </TouchableOpacity>
      </View>

      <View className="relative h-[80vh] flex-1 items-center justify-center">
        <CameraView
          style={{ height: '100%', width: '95%', borderRadius: 16, overflow: 'hidden' }}
          facing={facing}
          flash={flash}
          zoom={zoom}
          ref={cameraRef}
          mirror={facing === 'front'}
        />
        <Text className="absolute left-8 top-2 w-auto items-center justify-center rounded-lg bg-tethr-gray/80 px-3 py-2 text-white">
          {taskName}
        </Text>

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
      <View className="flex items-center">
        <TouchableOpacity onPress={handleTakePhoto} disabled={hasClicked}>
          <MaterialIcons name="radio-button-checked" size={72} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
