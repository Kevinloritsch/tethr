'use client';

import { View, Button, TextInput, Alert, Text } from 'react-native';
import { AppText } from '@/components/apptext';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [currentView, setCurrentView] = useState<'email' | 'verify' | 'authenticated'>('email');

  const testOTP = async () => {
    console.log('Sending OTP...');

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    });

    if (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', error.message);
    } else {
      setCurrentView('verify');
      console.log('Success! Check your email');
    }
  };

  const verifyOTP = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', error.message);
    }

    if (user) {
      const { error: insertError } = await supabase.from('users').upsert({
        user_id: user.id,
        username: username,
        name: name,
        email: user.email,
      });

      setCurrentView('authenticated');
      console.log('User authenticated:', data);

      if (insertError) console.error(insertError);
    }
  };

  if (currentView === 'email') {
    return (
      <View className="flex-1 justify-center p-4">
        <View className="justify-center text-center">
          <Text className="justify-center text-center text-lg text-white">
            Enter Your Email Address
          </Text>
          <Text className="justify-center text-center text-white">
            We will send you a One Time Password (OTP) on this address.
          </Text>
          <TextInput
            className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
            value={email}
            onChangeText={setEmail}
            placeholder="youremail@gmail.com"
            keyboardType="email-address"
          />
          <TextInput
            className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
            value={name}
            onChangeText={setName}
            placeholder="hjsdsdydgf"
          />
          <TextInput
            className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
            value={username}
            onChangeText={setUsername}
            placeholder="username"
          />
          <Button title="Continue" onPress={testOTP} disabled={email.trim().length === 0} />
        </View>
      </View>
    );
  }

  if (currentView === 'verify') {
    return (
      <View className="flex-1 justify-center p-4">
        <View style={{ alignItems: 'center' }}>
          <AppText size="large" className="justify-center text-white">
            Confirm Email Address
          </AppText>
          <AppText size="small" className="justify-center text-white">
            Enter the OTP we sent to {email}.
          </AppText>
          <TextInput
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 10,
              borderRadius: 25,
              width: 100,
              backgroundColor: 'white',
            }}
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            placeholder="123456"
            keyboardType="number-pad"
          />
          <Button title="Verify Email" onPress={verifyOTP} disabled={otp.length !== 6} />
          <Button
            title="Back to Email"
            onPress={() => {
              setOtp('');
              setEmail('');
              setCurrentView('email');
            }}
          />
        </View>
      </View>
    );
  }
  return <Redirect href={'/main'} />;
}
