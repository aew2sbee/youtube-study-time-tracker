# ブランチ命名ルール

- [GitHub branches 一覧](https://github.com/aew2sbee/youtube-study-time-tracker/branches)

## 基本ルール

- 英小文字とハイフンのみ使用
- 日本語・大文字・アンダースコア禁止
- 短く分かりやすい名前

## ブランチタイプ

### 機能追加
```
feature/機能名
```
例: `feature/user-login`, `feature/video-upload`

### バグ修正
```
fix/修正内容
```
例: `fix/login-error`, `fix/video-crash`

### ドキュメント
```
docs/内容
```
例: `docs/readme-update`, `docs/api-guide`

### リファクタリング
```
refactor/対象
```
例: `refactor/auth-service`, `refactor/video-player`

### 実験・調査
```
experiment/内容
```
例: `experiment/new-ui`, `experiment/performance`

## ブランチ作成例

```bash
# 機能追加
git checkout -b feature/video-bookmark

# バグ修正
git checkout -b fix/upload-timeout

# ドキュメント更新
git checkout -b docs/installation-guide
```

## 避けるべき例

1. ❌ `Feature/VideoUpload` (大文字)
2. ❌ `video_upload` (アンダースコア)
3. ❌ `ビデオアップロード` (日本語)
4. ❌ `temp` (意味が不明)