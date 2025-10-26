import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const myImage = require('../assets/tethr.png');

interface TethrSideProps {
  side: string;
}

const Tethr = ({ side }: TethrSideProps) => {
  return (
    <View className={`mx-auto h-[8vh] w-5/6 items-center justify-center`}>
      <View className={`w-1/5 ${side === 'left' ? 'self-start' : 'self-center'}`}>
        <Image style={styles.image} source={myImage} contentFit="contain" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    aspectRatio: 1,
  },
});

export default Tethr;
