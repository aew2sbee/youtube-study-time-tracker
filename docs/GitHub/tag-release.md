# タグリリース手順

- [GitHub Release 一覧](https://github.com/aew2sbee/youtube-study-time-tracker/releases)
- [GitHub Release 作成画面](https://github.com/aew2sbee/youtube-study-time-tracker/releases/new)

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
