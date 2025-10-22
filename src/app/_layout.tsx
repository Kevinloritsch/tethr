import { Tabs } from 'expo-router';
import '../../global.css';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function RootLayout() {
  return (
    <React.Fragment>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#A597FF',
          tabBarInactiveTintColor: 'white',
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopWidth: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            tabBarIcon: ({ color, size }) => <Feather name="list" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            tabBarIcon: ({ size }) => (
              <View
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    position: 'absolute',
                    height: 80,
                    width: 80,
                    borderRadius: 40,
                    backgroundColor: 'black',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    backgroundColor: '#A597FF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <AntDesign name="camera" size={size} color="#ffffff" />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="friends"
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
          }}
        />
      </Tabs>
    </React.Fragment>
  );
}
