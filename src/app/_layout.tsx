import { Tabs } from "expo-router"; // 💡 Stack から Tabs に変更
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // アイコンのインポート

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#007AFF",
        }}
      >
        {/* 1. ホームタブ: nameを (tabs)/home に修正 */}
        <Tabs.Screen
          name="(tabs)/home"
          options={{
            title: "ホーム",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />

        {/* 2. 投稿タブ: nameを (tabs)/post に修正 */}
        <Tabs.Screen
          name="(tabs)/post"
          options={{
            title: "投稿",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="plus-circle"
                color={color}
                size={size}
              />
            ),
            // headerShown: true,
          }}
        />

        {/* 3. プロフィールタブ: nameを (tabs)/profile に修正 */}
        <Tabs.Screen
          name="(tabs)/profile"
          options={{
            title: "プロフィール",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account"
                color={color}
                size={size}
              />
            ),
          }}
        />

        {/* ⚠️ タブとして表示したくないルートは、Tabsコンポーネントの子として含めてはいけません。
             また、ナビゲーションの構造に合わせて、その他の画面を管理する必要があります。 */}
      </Tabs>
    </>
  );
}
