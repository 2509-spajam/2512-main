# 2512-main

React Native Expo プロジェクト

## 概要

このプロジェクトは React Native Expo SDK 54（安定版）を使用して初期化されています。

## セットアップ

依存関係のインストール:

```bash
npm install
```

## 実行方法

開発サーバーの起動:

```bash
npm start

# または（起動できない場合）
npm run start:tunnel
```

プラットフォーム別の実行:

```bash
# Android
npm run android

# iOS (macOS が必要)
npm run ios

# Web
npm run web

# Tunneling (NGROK)
# 実機デバッグ時にネットワークの制限がある場合などに使用
npm run start:tunnel
```

## 技術スタック

- React Native 0.81.5
- Expo SDK ~54.0.27
- React 19.1.0

## プロジェクト構造

- `App.js` - メインアプリケーションコンポーネント
- `app.json` - Expo 設定ファイル
- `assets/` - 画像やアイコンなどのアセット
- `index.js` - エントリーポイント
