import { View, Image, Text } from 'react-native';
type CardType = 'top' | 'middle' | 'bottom' | 'solo';

export interface FriendProps {
  pfpUrl: string;
  username: string;
  buttonText: string;
  cardType: CardType;
}

const FriendCard = ({ pfpUrl, username, buttonText, cardType }: FriendProps) => {
  const roundedMap: Record<CardType, string> = {
    top: 'rounded-t-2xl',
    middle: '',
    bottom: 'rounded-b-2xl',
    solo: 'rounded-2xl',
  };

  const roundedClass = roundedMap[cardType];
  return (
    <View className={`flex items-center justify-between ${roundedClass}`}>
      <Image source={{ uri: pfpUrl }} className="w-1/5 rounded-full" style={{ aspectRatio: 1 }} />
      <Text>{username}</Text>
      <Text>{buttonText}</Text>
    </View>
  );
};

export default FriendCard;
