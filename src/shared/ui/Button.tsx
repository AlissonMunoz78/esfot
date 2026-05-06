import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

interface Props extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ label, loading = false, variant = 'primary', style, ...rest }: Props) {
  const bg =
    variant === 'danger' ? '#C0392B' : variant === 'secondary' ? '#EBF5FB' : '#1A3A5C';
  const color = variant === 'secondary' ? '#2E6DA4' : '#fff';

  return (
    <TouchableOpacity
      style={[styles.base, { backgroundColor: bg }, rest.disabled && styles.disabled, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.label, { color }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.6 },
  label: { fontSize: 15, fontWeight: '700' },
});
