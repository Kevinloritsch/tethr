import { View } from "react-native";
import { AppText } from "@/components/AppText";

export default function ExploreScreen() {
  return (
    <View className="justify-center flex-1 p-4">
      <AppText center>
        Open up <AppText bold>app/explore.tsx</AppText> to start working on your
        app!
      </AppText>
    </View>
  );
}
