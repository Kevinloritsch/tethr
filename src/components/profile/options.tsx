import { View, Text, Pressable } from 'react-native';
interface OptionsTypes {
  logoutHandler: () => Promise<void>;
}
const Options = ({ logoutHandler }: OptionsTypes) => {
  return (
    <View className="flex flex-col items-center gap-2 text-white">
      <Pressable className="w-3/4 rounded-xl bg-tethr-purple/80 py-1">
        {' '}
        <Text> Log Out</Text>
      </Pressable>
      <Pressable className="w-3/4 rounded-xl bg-tethr-purple/80 py-1">
        {' '}
        <Text> Delete Account</Text>{' '}
      </Pressable>
      <Pressable className="my-5 w-3/4 rounded-xl bg-tethr-purple/80 py-1" onPress={logoutHandler}>
        <Text> Privacy Policy</Text>
      </Pressable>
    </View>
  );
};

export default Options;
