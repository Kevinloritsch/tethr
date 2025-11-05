import { View, Text, TouchableOpacity } from 'react-native';
interface OptionsTypes {
  logoutHandler: () => Promise<void>;
}
const Options = ({ logoutHandler }: OptionsTypes) => {
  return (
    <View className="flex flex-col items-center gap-2 text-white">
      <TouchableOpacity
        className="w-3/4 rounded-xl bg-tethr-purple/80 py-1"
        onPress={logoutHandler}>
        <Text className="text-center"> Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity className="w-3/4 rounded-xl bg-tethr-purple/80 py-1">
        <Text className="text-center"> Delete Account</Text>{' '}
      </TouchableOpacity>
      <TouchableOpacity className="my-5 w-3/4 rounded-xl bg-tethr-purple/80 py-1">
        <Text className="text-center"> Privacy Policy</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Options;
