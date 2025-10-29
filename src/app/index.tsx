'use client'

import { View, Button, TextInput, Alert } from 'react-native';
import { AppText } from '@/components/apptext';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function IndexScreen() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const testOTP = async () => {
    console.log('Sending OTP...')
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    })

    if (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', error.message);
    } else {
      console.log('Success! Check your email');
      setOtpSent(true);
      Alert.alert('Success', 'Check your email for the OTP code');
    }
  }

  const verifyOTP = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    })

    if (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', error.message);
    } else{
      console.log('User authenticated:', data);
      Alert.alert('Success!', 'You are now logged in!');
    }
  }

  return (
    <View className="flex-1 justify-center p-4">
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        value={email}
        onChangeText={setEmail}
        placeholder="tethr@gmail.com"
      />
       <Button title="Send Test OTP" onPress={testOTP} />
      <TextInput
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            value={otp}
            onChangeText={setOtp}
            placeholder="123456"
            keyboardType="number-pad"
          />
      <Button title="Verify OTP" onPress={verifyOTP} />
      <AppText center>
        Open up <AppText bold>app/index.tsx</AppText> to start working on your app!
      </AppText>
    </View>
  );
}
