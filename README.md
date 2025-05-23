# PG Editor - ブラウザベースIDE

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
</p>

PG Editorは、インストール不要でブラウザ上で動作する軽量なIDEです。オフライン対応、ファイル管理、コード実行環境を備え、どこでもコーディングが可能です。

## 🚀 特徴

### 主要機能
- **🖊️ 高機能エディタ** - Monaco Editor（VS Codeと同じエディタ）を採用
- **📁 ファイル管理** - 仮想ファイルシステムでファイルとフォルダを管理
- **▶️ コード実行** - JavaScript/TypeScriptをサンドボックス環境で実行
- **💻 統合ターミナル** - xterm.jsによる組み込みターミナル
- **🎨 テーマ切り替え** - ダーク/ライトモード対応
- **📱 PWA対応** - オフラインでも使用可能
- **📤 ドラッグ&ドロップ** - ファイルをドラッグ&ドロップで開く
- **💾 ローカル保存** - File System Access APIでローカルファイルに保存

### 対応言語
- JavaScript / TypeScript
- HTML / CSS / SCSS
- JSON
- Markdown
- Python（表示のみ）
- その他多数の言語の構文ハイライト

## 📦 インストール

### 前提条件
- Node.js 18.0以上
- npm または yarn

### セットアップ

```bash
# リポジトリをクローン
git clone git@github.com:fcircle-biz/pg_editer.git
cd pg_editer

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

## 🎯 使い方

### 基本操作

#### ファイルの作成
1. サイドバーの「New File」ボタンをクリック
2. ファイル名を入力（例：`index.js`）

#### コードの実行
1. JavaScriptまたはTypeScriptファイルを開く
2. コードを入力
3. ターミナルで `run` コマンドを実行

#### ファイルの保存
- **Ctrl/Cmd + S** でファイルを保存
- ローカルファイルシステムまたはブラウザストレージに保存可能

### ターミナルコマンド
```bash
help    # ヘルプを表示
clear   # ターミナルをクリア
run     # 現在のファイルを実行
echo    # テキストを表示
date    # 現在時刻を表示
```

### ショートカットキー
| キー | 動作 |
|------|------|
| Ctrl/Cmd + S | ファイルを保存 |
| Ctrl/Cmd + P | ファイルを検索（開発中） |
| Ctrl/Cmd + Shift + P | コマンドパレット（開発中） |

## 🏗️ アーキテクチャ

```
┌───────────────┐
│  UI Layer     │  React + TypeScript + Tailwind CSS
├───────────────┤
│  IDE Core     │  Monaco Editor
│               │  xterm.js（ターミナル）
├───────────────┤
│  Runtime Hub  │  Web Workers / Sandboxed IFrame
├───────────────┤
│  Storage      │  IndexedDB / File System Access API
└───────────────┘
```

### 技術スタック
- **フロントエンド**: React 18, TypeScript 5
- **エディタ**: Monaco Editor 0.50+
- **ターミナル**: xterm.js 5.x
- **ビルドツール**: Vite 5
- **スタイリング**: Tailwind CSS
- **テスト**: Vitest, Playwright
- **ストレージ**: IndexedDB (idb)

## 🧪 開発

### スクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プレビュー
npm run preview

# テスト実行
npm run test

# カバレッジ付きテスト
npm run test:coverage

# E2Eテスト
npm run test:e2e

# リント
npm run lint

# フォーマット
npm run format

# 型チェック
npm run typecheck
```

### プロジェクト構成

```
pg_editor/
├── src/
│   ├── components/      # UIコンポーネント
│   ├── contexts/        # React Context
│   ├── hooks/           # カスタムフック
│   ├── lib/             # ユーティリティ
│   ├── types/           # TypeScript型定義
│   └── test/            # テスト関連
├── public/              # 静的ファイル
├── e2e/                 # E2Eテスト
└── docs/                # ドキュメント
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約
- ESLintとPrettierの設定に従う
- TypeScriptの厳格モードを使用
- テストを書く（目標カバレッジ: 80%以上）

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🚧 今後の機能

- [ ] Git統合
- [ ] 複数ファイルの同時編集（スプリットビュー）
- [ ] プラグインシステム
- [ ] Python実行環境（Pyodide）
- [ ] リアルタイムコラボレーション
- [ ] AI補完機能
- [ ] より多くの言語サポート

## 🐛 既知の問題

- 大きなファイル（>5MB）を開くとパフォーマンスが低下する
- Safari でFile System Access APIが利用できない
- モバイルデバイスでの編集体験が限定的

## 📞 サポート

問題や質問がある場合は、[Issues](https://github.com/fcircle-biz/pg_editer/issues)でお知らせください。

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [xterm.js](https://xtermjs.org/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

<p align="center">
  Made with ❤️ by the PG Editor Team
</p>