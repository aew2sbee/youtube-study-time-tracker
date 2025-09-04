# プルリクエスト タイトル規則

- [GitHub Pull Request 一覧](https://github.com/aew2sbee/youtube-study-time-tracker/pulls)

## 基本形式

```
[種類] 変更内容
```

## 種類

- `feat` - 新機能追加
- `fix` - バグ修正
- `docs` - ドキュメント更新
- `refactor` - リファクタリング
- `test` - テスト追加・修正
- `chore` - その他の変更

## 良い例

```
feat: ユーザーログイン機能を追加
fix: 動画アップロード時のエラーを修正
docs: README.mdを更新
refactor: 認証サービスをクラス化
test: ユーザー登録のテストを追加
chore: 依存関係を更新
```

## 避けるべき例

1. ❌ `機能追加` (種類が不明)
2. ❌ `Fix bug` (具体性に欠ける)
3. ❌ `Update` (何を更新したか不明)
4. ❌ `WIP` (作業中はドラフトにする)