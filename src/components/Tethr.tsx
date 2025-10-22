import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const myImage = require('../assets/tethr.png');

export default function App() {
  return (
    <View className="mx-auto h-[10vh] w-full items-center justify-center">
      <View className="aspect-auto w-1/5">
        <Image
          style={styles.image}
          source={myImage}
          contentFit="contain" // or "cover", "fill"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    aspectRatio: 1, // keep square proportions
  },
});
