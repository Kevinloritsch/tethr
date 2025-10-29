'use client';

import { View, Button, TextInput, Alert } from 'react-native';
import { AppText } from '@/components/apptext';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function IndexScreen() {
  const [email, setEmail] = useState('');
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

    if (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', error.message);
    } else {
      setCurrentView('authenticated');
      console.log('User authenticated:', data);
    }
  };

  if (currentView === 'email') {
    return (
      <View className="flex-1 justify-center p-4" key="email-view">
        <View style={{ alignItems: 'center' }}>
          <AppText size="large" center>
            Enter Your Email Address
          </AppText>
          <AppText size="small" center>
            We will send you a One Time Password (OTP) on this address.
          </AppText>
          <TextInput
            style={{
              borderWidth: 1,
              padding: 10,
              marginTop: 10,
              marginBottom: 10,
              borderRadius: 25,
              width: 300,
            }}
            value={email}
            onChangeText={setEmail}
            placeholder="youremail@gmail.com"
            key="email-input"
            keyboardType="email-address"
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
          <AppText size="large" center>
            Confirm Email Address
          </AppText>
          <AppText size="small" center>
            Enter the OTP we sent to {email}.
          </AppText>
          <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 25, width: 100 }}
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
  return (
    <View className="flex-1 justify-center p-4">
      <View style={{ alignItems: 'center' }}>
        <AppText center>
          Open up <AppText bold>app/index.tsx</AppText> to start working on your app!
        </AppText>
      </View>
    </View>
  );
}
