type CardType = "top" | "middle" | "bottom" | "solo";
import { View, Image, Text } from "react-native";

interface FriendProps {
    pfpUrl: string,
    username: string,
    buttonText: string,
    cardType: CardType
}

const FriendCard = ({pfpUrl, username, buttonText, cardType}: FriendProps) => {
    return(
        <View className="flex items-center justify-between rounded-2xl">
            <Image source={{uri: pfpUrl}} className="w-1/5 rounded-full" style={{ aspectRatio: 1}}/>
            <Text>{username}</Text>
            <Text>{buttonText}</Text>
        </View>
    )
}

export default FriendCard