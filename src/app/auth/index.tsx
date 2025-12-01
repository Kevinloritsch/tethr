'use client';

import { View, TextInput, Alert, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as SplashScreen from 'expo-splash-screen';

import Tethr from '@/components/tethr';

export default function IndexScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [currentView, setCurrentView] = useState<'email' | 'verify' | 'authenticated'>('email');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const OTP = async () => {
    setLoading(true);
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

    if (authMode === 'login') {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (checkError || !existingUser) {
        console.log('user does not exist');
        Alert.alert(
          'Account Not Found',
          'No account exists with this email. Please sign up instead.'
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
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
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
    setLoading(true);
  };

  if (currentView === 'email') {
    return (
      <View className="flex-1 p-4">
        <View className="relative h-[10vh] w-full items-center">
          <Tethr side="center" />
        </View>

        <View className="justify-center rounded-lg bg-tethr-gray/80 p-4 text-center">
          <Text className="justify-center pb-2 text-center text-white">
            {authMode === 'signup'
              ? 'Welcome to Tethr! Please sign up below.'
              : 'Welcome back to Tethr! Please login below.'}
          </Text>
          <TextInput
            className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
            value={email}
            onChangeText={setEmail}
            placeholder="youremail@gmail.com"
            placeholderTextColor="#DEDEDE"
            keyboardType="email-address"
            returnKeyType="done"
            autoCapitalize="none"
          />
          {authMode === 'signup' && (
            <TextInput
              className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
              value={name}
              onChangeText={setName}
              placeholder="Person Doe"
              placeholderTextColor="#DEDEDE"
              returnKeyType="done"
            />
          )}
          {authMode === 'signup' && (
            <TextInput
              className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#DEDEDE"
              returnKeyType="done"
              autoCapitalize="none"
            />
          )}
          <TouchableOpacity onPress={OTP} disabled={email.trim().length === 0 || loading}>
            <Text
              className={`py-2 text-center font-semibold ${email.trim().length > 0 ? 'text-tethr-purple' : 'text-gray-500'}`}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
          className="flex flex-row items-center justify-end gap-2">
          {authMode === 'signup' && (
            <Text className="my-2 text-center text-white">Already have an account?</Text>
          )}
          {authMode === 'login' && (
            <Text className="my-2 text-center text-white">Don&apos;t have an account?</Text>
          )}

          <Text className="my-2 text-center text-tethr-purple">
            {authMode === 'signup' ? 'Login' : 'Sign Up'}
          </Text>

          <Text className="my-2 text-center text-white">instead!</Text>
          <MaterialCommunityIcons name="chevron-right" size={36} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  if (currentView === 'verify') {
    return (
      <View className="flex-1 p-4">
        <View className="relative h-[10vh] w-full items-center">
          <Tethr side="center" />
        </View>
        <View className="rounded-lg bg-tethr-gray/80 p-4 text-center">
          <Text className="justify-center pb-2 text-center text-xl font-bold text-white">
            Confirm Email Address
          </Text>
          <Text className="justify-center pb-4 text-center text-white">
            Enter the OTP we sent to {email}.
          </Text>
          <TextInput
            className="border-1 m-2 mx-auto w-3/4 rounded-lg bg-white p-2"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            placeholder="123456"
            placeholderTextColor="#DEDEDE"
            keyboardType="number-pad"
            returnKeyType="done"
          />
          <TouchableOpacity onPress={verifyOTP} disabled={otp.length !== 6 || loading}>
            <Text
              className={`py-2 text-center font-semibold ${otp.length === 6 ? 'text-tethr-purple' : 'text-gray-500'}`}>
              Verify Email
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            setOtp('');
            setEmail('');
            setCurrentView('email');
          }}
          className="flex flex-row items-center justify-end gap-2">
          <Text className="my-2 text-center text-white">Need to change your email?</Text>
          <Text className="my-2 text-center text-tethr-purple">Go Back</Text>
          <MaterialCommunityIcons name="chevron-right" size={36} color="white" />
        </TouchableOpacity>
      </View>
    );
  }
  return <Redirect href={'/main'} />;
}
