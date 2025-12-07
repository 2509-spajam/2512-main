import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { AuthButton } from '../components/AuthButton';
import { authService, validateId, validateName, validatePassword } from '../services/authService';
import { COLORS } from '../constants/colors';

export default function SignupScreen() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError(null);

    // Validation
    const idError = validateId(id);
    if (idError) { setError(idError); return; }

    const nameError = validateName(name);
    if (nameError) { setError(nameError); return; }

    const passError = validatePassword(password);
    if (passError) { setError(passError); return; }

    setLoading(true);
    try {
      const user = await authService.signup(id, name, password);
      await signup(user);
      // _layout will handle redirect
    } catch (e: any) {
      setError(e.message || "新規登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>アカウント作成</Text>

      <View style={styles.form}>
        <Text style={styles.label}>ユーザーID</Text>
        <TextInput
          style={styles.input}
          value={id}
          onChangeText={setId}
          placeholder="3-20文字、英数字記号"
          autoCapitalize="none"
        />

        <Text style={styles.label}>名前</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="表示名"
        />

        <Text style={styles.label}>パスワード</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="8文字以上、英字と数字/記号を含む"
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <AuthButton title="登録する" onPress={handleSignup} isLoading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>すでにアカウントをお持ちですか？ </Text>
          <Link href="/login" asChild>
            <Text style={styles.link}>ログイン</Text>
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
