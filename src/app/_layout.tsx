import { Tabs } from "expo-router"; // 💡 Stack から Tabs に変更
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // アイコンのインポート

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Tabs // Stack を Tabs に変更
        screenOptions={{
          headerShown: false, // ヘッダーを非表示にする設定を継承
          tabBarActiveTintColor: "#007AFF", // アクティブなタブの色を設定
        }}
      >
        {/* 1. ホームタブ */}
        <Tabs.Screen
          name="home" // app/home.js または app/(tabs)/home.js に対応
          options={{
            title: "ホーム", // タブに表示されるラベル
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />

        {/* 2. 投稿タブ */}
        <Tabs.Screen
          name="post" // app/post.js または app/(tabs)/post.js に対応
          options={{
            title: "投稿",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="plus-circle"
                color={color}
                size={size}
              />
            ),
            // 例: 投稿画面のみヘッダーを表示したい場合
            // headerShown: true,
          }}
        />

        {/* 3. プロフィールタブ */}
        <Tabs.Screen
          name="profile" // app/profile.js または app/(tabs)/profile.js に対応
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

        {/* ⚠️ 注意: 既存の Stack.Screen 定義は Tab Navigator の子として不適切なので削除します
        <Tabs.Screen name="index" /> 
        <Tabs.Screen name="detail" /> 
        <Tabs.Screen name="map" />
        <Tabs.Screen name="camera" />
        <Tabs.Screen name="spot-result" />
        <Tabs.Screen name="result" />
        */}
      </Tabs>
    </>
  );
}
