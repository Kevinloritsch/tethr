import { Fontisto } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import { TouchableOpacity, Image, View, Text } from 'react-native';

const PhotoPreview = ({
  photo,
  handleRetakePhoto,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
}) => (
  <View className="flex-1 justify-between py-8">
    <View className="h-[10vh] items-center justify-center">
      <Text className="text-2xl font-bold text-black">Tethr Logo</Text>
    </View>

    <View className="h-[80vh] flex-1 items-center justify-center">
      <Image
        className="w-[95%] rounded-2xl"
        style={{ height: '100%', borderRadius: 16, overflow: 'hidden' }}
        source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
      />
    </View>

    <View className="h-[10vh] items-center justify-center">
      <TouchableOpacity onPress={handleRetakePhoto}>
        <Fontisto name="trash" size={36} color="black" />
      </TouchableOpacity>
    </View>
  </View>
);

export default PhotoPreview;
