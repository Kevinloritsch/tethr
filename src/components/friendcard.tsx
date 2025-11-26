import { View, Image, Text, TouchableOpacity } from 'react-native';
import { roundedMap } from '@/utils/cardType';
type CardType = 'top' | 'middle' | 'bottom' | 'solo';

export interface FriendProps {
  pfpUrl: string;
  username: string;
  buttonText: string;
  cardType: CardType;
  userId: string;
  pressFunction?: (userId: string) => void;
}

const FriendCard = ({
  pfpUrl,
  username,
  userId,
  buttonText,
  cardType,
  pressFunction,
}: FriendProps) => {
  const roundedClass = roundedMap[cardType];
  return (
    <View
      className={`flex w-full flex-row items-center justify-between bg-tethr-gray/50 px-5 py-4 text-white ${roundedClass}`}>
      <View className="flex w-2/3 flex-row items-center gap-4">
        <Image source={{ uri: pfpUrl }} className="w-1/6 rounded-full" style={{ aspectRatio: 1 }} />
        <Text className="text-xl text-white">{username}</Text>
      </View>
      <TouchableOpacity
        className="flex w-1/4 flex-col items-center rounded-2xl bg-tethr-purple/70 p-2"
        onPress={() => {
          if (pressFunction) {
            pressFunction(userId);
          } else {
            console.log('error with button function');
          }
        }}>
        <Text className="text-white">{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FriendCard;
