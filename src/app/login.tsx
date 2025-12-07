import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { AuthButton } from '../components/AuthButton';
import { authService, validateId } from '../services/authService';
import { COLORS } from '../constants/colors';

export default function LoginScreen() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    const idError = validateId(id);
    if (idError) {
      setError(idError);
      return;
    }
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(id, password);
      await login(user);
      // user will be redirected by layout or we can do it here explicitly if needed.
      // Layout protection usually handles it, but explicit replace is safer for UI feel.
      // router.replace('/'); // _layout will handle redirect
    } catch (e: any) {
      setError(e.message || "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>

      <View style={styles.form}>
        <Text style={styles.label}>ユーザーID</Text>
        <TextInput
          style={styles.input}
          value={id}
          onChangeText={setId}
          placeholder="IDを入力してください"
          autoCapitalize="none"
        />

        <Text style={styles.label}>パスワード</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="パスワードを入力してください"
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <AuthButton title="ログイン" onPress={handleLogin} isLoading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>アカウントをお持ちでないですか？ </Text>
          <Link href="/signup" asChild>
            <Text style={styles.link}>新規登録</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
