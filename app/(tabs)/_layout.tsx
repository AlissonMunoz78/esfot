// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@features/auth/api/authApi';
import { Tabs } from 'expo-router';
import { Alert, TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => authApi.signOut() },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A3A5C',
        headerStyle: { backgroundColor: '#1A3A5C' },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Proyectos',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registro"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
