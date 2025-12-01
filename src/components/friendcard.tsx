import { View, Image, Text, TouchableOpacity } from 'react-native';
import { roundedMap } from '@/utils/cardType';
import AntDesign from '@expo/vector-icons/AntDesign';

type CardType = 'top' | 'middle' | 'bottom' | 'solo';

export interface FriendProps {
  pfpUrl: string;
  username: string;
  buttonText: string;
  secondButtonText?: string;
  cardType: CardType;
  userId: string;
  pressFunction?: (userId: string) => void;
  secondPressFunction?: (userId: string) => void;
}

const FriendCard = ({
  pfpUrl,
  username,
  userId,
  buttonText,
  secondButtonText,
  cardType,
  pressFunction,
  secondPressFunction,
}: FriendProps) => {
  const roundedClass = roundedMap[cardType];

  const renderContent = (text: string) => {
    if (text === 'check') {
      return <AntDesign name="check" size={20} color="white" />;
    }
    if (text === 'close') {
      return <AntDesign name="close" size={20} color="white" />;
    }
    return <Text className="text-white">{text}</Text>;
  };

  return (
    <View
      className={`flex w-full flex-row items-center justify-between bg-tethr-gray/50 px-5 py-4 text-white ${roundedClass}`}>
      <View className="flex w-2/3 flex-row items-center gap-4">
        <Image source={{ uri: pfpUrl }} className="w-1/6 rounded-full" style={{ aspectRatio: 1 }} />
        <Text className="text-xl text-white">{username}</Text>
      </View>
      <View className="flex flex-row gap-2">
        <TouchableOpacity
          className="items-center justify-center rounded-2xl bg-tethr-purple/70 px-4 py-2"
          onPress={() => {
            if (pressFunction) {
              pressFunction(userId);
            } else {
              console.log('error with button function');
            }
          }}>
          {renderContent(buttonText)}
        </TouchableOpacity>
        {secondButtonText && (
          <TouchableOpacity
            className="rounded-2xl bg-tethr-gray/70 px-4 py-2"
            onPress={() => secondPressFunction?.(userId)}>
            {renderContent(secondButtonText)}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FriendCard;
