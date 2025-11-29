import { Stack } from 'expo-router';
import React from 'react';

export default function TasksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
