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

// Mock DB latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (id: string, pass_hash: string) => {
    await delay(1000);
    // In a real app, verify hash here.
    // For mock, just checking valid ID format is enough to "login" if we assume user exists.
    // But let's simulates simple success.

    // Simulate error for specific test case if needed, or just success.
    if (!id || !pass_hash) throw new Error("IDまたはパスワードが間違っています");

    return {
      id: id,
      name: "テストユーザー", // Mock name
      token: "mock-jwt-token-123",
      created_at: new Date().toISOString()
    };
  },

  signup: async (id: string, name: string, pass_hash: string) => {
    await delay(1500);
    // Validate again just in case
    if (validateId(id) || validateName(name) || validatePassword(pass_hash)) {
      throw new Error("入力内容に誤りがあります");
    }

    return {
      id: id,
      name: name,
      token: "mock-jwt-token-456",
      created_at: new Date().toISOString()
    };
  }
};
