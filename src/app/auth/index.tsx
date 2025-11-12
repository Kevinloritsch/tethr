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
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [currentView, setCurrentView] = useState<'email' | 'verify' | 'authenticated'>('email');

  const testOTP = async () => {
    console.log(authMode);
    if (authMode === 'signup') {
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username, email')
        .or(`username.eq.${username},email.eq.${email}`);
      if (checkError) {
        console.error(checkError);
        Alert.alert('Error', 'There was a problem checking user availability.');
        return;
      }
      if (existingUsers.length > 0) {
        console.log('user already exists');
        Alert.alert(
          'Account Already Exists',
          'An account with that username or email already exists. Please try logging in instead.'
        );
        return;
      }
    }
    console.log('Sending OTP...');

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: authMode === 'signup' ? { data: { username: username, name: name } } : {},
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

    if (user && authMode === 'signup') {
      const { error: insertError } = await supabase.from('users').upsert({
        user_id: user.id,
        username: username,
        name: name,
        email: user.email,
      });

      setCurrentView('authenticated');
      console.log('User authenticated:', data);

      if (insertError) console.error(insertError);
    } else if (user) {
      setCurrentView('authenticated');
      console.log('User authenticated:', data);
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
          {authMode === 'signup' && (
            <TextInput
              className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
              value={name}
              onChangeText={setName}
              placeholder="hjsdsdydgf"
            />
          )}
          {authMode === 'signup' && (
            <TextInput
              className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
              value={username}
              onChangeText={setUsername}
              placeholder="username"
            />
          )}
          <Button title="Continue" onPress={testOTP} disabled={email.trim().length === 0} />
          {authMode === 'signup' && (
            <Text className="my-2 text-center text-white">Already have an account?</Text>
          )}
          {authMode === 'login' && (
            <Text className="my-2 text-center text-white">Don&apos;t have an account?</Text>
          )}
          <Button
            title={authMode === 'signup' ? 'Switch to Login' : 'Switch to Sign Up'}
            onPress={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
          />
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
            className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
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
