import { supabase } from '../lib/supabase';
import * as Crypto from 'expo-crypto';

// Mock Service for Authentication

export const validateId = (id: string): string | null => {
  const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{3,20}$/;
  if (!id) return "IDは必須です";
  if (id.length < 3 || id.length > 20) return "IDは3文字以上20文字以内で入力してください";
  if (!regex.test(id)) return "IDに使用できない文字が含まれています";
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name || name.trim().length === 0) return "名前は必須です";
  if (name.length > 30) return "名前は30文字以内で入力してください";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "パスワードは必須です";
  if (password.length < 8) return "パスワードは8文字以上で入力してください";
  // "Some good feeling" constraints (some letters + some numbers/symbols)
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbersOrSymbols = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasLetters || !hasNumbersOrSymbols) {
    return "パスワードは英字と数字/記号の両方を含める必要があります";
  }
  return null;
};

const hashPassword = async (password: string) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return digest;
};

export const authService = {
  login: async (id: string, password: string) => {
    // 1. Hash password
    const pass_hash = await hashPassword(password);

    // 2. Query Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (error) {
      console.error("Login error:", error);
      throw new Error("ログインに失敗しました");
    }

    if (!data || data.length === 0) {
      throw new Error("IDまたはパスワードが間違っています");
    }

    const user = data[0];

    // 3. Compare hash
    // Note: In a real secure system, we should verify using a timing-safe comparison,
    // but here we are doing a simple string comparison as requested.
    if (user.pass_hash !== pass_hash) {
      throw new Error("IDまたはパスワードが間違っています");
    }

    return {
      id: user.id,
      name: user.name,
      created_at: user.created_at
    };
  },

  signup: async (id: string, name: string, password: string) => {
    // Validate again just in case
    if (validateId(id) || validateName(name) || validatePassword(password)) {
      throw new Error("入力内容に誤りがあります");
    }

    // Hash
    const pass_hash = await hashPassword(password);

    // Insert logic
    const { data, error } = await supabase
      .from('users')
      .insert([
        { id, name, pass_hash }
      ])
      .select(); // Remove .single()

    if (error) {
      console.error("Signup error:", error);
      if (error.code === '23505') { // Unique violation
        throw new Error("このIDは既に使用されています");
      }
      throw new Error("新規登録に失敗しました");
    }

    if (!data || data.length === 0) {
      throw new Error("新規登録に失敗しました");
    }

    const newUser = data[0];

    return {
      id: newUser.id,
      name: newUser.name,
      created_at: newUser.created_at
    };
  }
};
