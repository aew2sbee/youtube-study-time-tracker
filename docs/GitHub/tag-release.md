# タグリリース手順

- [GitHub Release 一覧](https://github.com/aew2sbee/youtube-study-time-tracker/releases)
- [GitHub Release 作成画面](https://github.com/aew2sbee/youtube-study-time-tracker/releases/new)

## セマンティック バージョニング (Semantic Versioning, SemVer)
1. MAJOR（メジャー）: 大きなバージョン (壊れる可能性あり)
   - 後方互換性を壊す変更があったときに上がる。
   - 例: 既存のAPIを削除、仕様を大きく変更、これまで動いていたコードを動かなくする可能性がある場合。

2. MINOR（マイナー）: 新機能追加 (互換性あり)
   - 後方互換性を保ちながら新機能を追加したときに上がる。
   - 例: 新しいオプションやメソッドを追加するが、既存の機能はそのまま動作する場合。

3. PATCH（パッチ）: バグ修正や小改良
   - バグ修正や小さな改善で、後方互換性に影響がない場合に上がる。
   - 例: セキュリティ修正、ドキュメント修正、内部の最適化など。

## 基本的なタグ作成

### 軽量タグ

```bash
git tag v1.0.0
```

### 注釈付きタグ（推奨）

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

## タグをリモートにプッシュ

### 特定のタグをプッシュ

```bash
git push origin v1.0.0
```

### 全てのタグをプッシュ

```bash
git push origin --tags
```

## リリース手順（推奨）

1. **リリース準備**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **タグ作成**

   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   ```

3. **タグプッシュ**
   ```bash
   git push origin v1.0.0
   ```

## タグの確認

### ローカルタグ一覧

```bash
git tag
```

### タグの詳細表示

```bash
git show v1.0.0
```

## タグの削除

### ローカルタグ削除

```bash
git tag -d v1.0.0
```

### リモートタグ削除

```bash
git push origin --delete v1.0.0
```
