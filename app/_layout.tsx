import { supabase } from '@shared/api/supabase';
import { LoginScreen } from '@features/auth/ui/LoginScreen';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#1A3A5C" />
      </View>
    );
  }

  if (!session) {
    return <LoginScreen onAuthSuccess={() => {}} />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="proyecto/[id]" options={{ title: 'Detalle del proyecto' }} />
      <Stack.Screen name="proyecto/[id]/editar" options={{ title: 'Editar proyecto' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
