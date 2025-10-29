import { Stack } from 'expo-router';

export default function CameraLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="chooseGroup" />
      <Stack.Screen name="chooseTask" />
      <Stack.Screen name="takePhoto" />
    </Stack>
  );
}
