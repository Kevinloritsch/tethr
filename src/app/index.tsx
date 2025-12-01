import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    }) as any;

    return () => {
      try {
        listener?.subscription?.unsubscribe?.();
      } catch (e) {
        console.error('Error unsubscribing from auth listener', e);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View className="items-center justify-center">
        <ActivityIndicator testID="loading-indicator" size="large" color="#fff" />
      </View>
    );
  }

  return <Redirect href={session ? '/main' : '/auth'} />;
}
