# タグを使ったリリース手順

このドキュメントは、任意のコミットに対して Git のタグを打ち、GitHub に公開リリースするまでの最小手順をまとめたものです。

### 前提

- リモート: origin（GitHub）
- タグは注釈付きタグ（-a）で作成します。
- バージョン表記: SemVer 例) v1.0.0

### 1. 最新化

```bash
# すべてのブランチ/タグを取得
git fetch --all --tags
```

### 2. 対象コミットの確認

- 例: 直近のコミットにタグ → HEAD を使う
- 例: 特定コミットにタグ → <commit>（例: c686c24）を使う

```bash
# 例: 特定コミットを確認
git show --no-patch --oneline c686c24
```

### 3. タグの作成

- HEAD に付ける場合

```bash
git tag -a v1.0.0 -m "v1.0.0"
```

- 特定コミットに付ける場合

```bash
git tag -a v1.0.0 c686c24 -m "v1.0.0 (#20)"
```

オプション（署名付きタグ）

```bash
git tag -s v1.0.0 -m "v1.0.0"
```

### 4. タグのプッシュ

```bash
git push origin v1.0.0
```

複数タグをまとめてプッシュする場合

```bash
git push origin --tags
```

### 5. タグの確認

```bash
# ローカルのタグ
git tag -l

# リモートに反映されたか確認
git ls-remote --tags origin | grep v1.0.0 || true
```

### 6. GitHub リリースの作成

- Web UI から: GitHub の Releases で新規リリース → 既存タグ v1.0.0 を選択して公開
- CLI（任意）: GitHub CLI を利用

```bash
# GitHub CLI（インストール済み想定）
# 自動リリースノートを生成
gh release create v1.0.0 --generate-notes -t "v1.0.0"

# または手動で本文を指定
# gh release create v1.0.0 -t "v1.0.0" -n "変更点の概要"
```

### 7. タグを修正したい（付け直し）

同名タグが既に存在する場合は、削除して付け直します。

```bash
# ローカルのタグを削除
git tag -d v1.0.0
# リモートのタグを削除
git push origin :refs/tags/v1.0.0

# 再作成してプッシュ
git tag -a v1.0.0 c686c24 -m "v1.0.0 (#20)"
git push origin v1.0.0
```

### 8. よくあるトラブル

- タグ名の重複: 既に存在する場合は削除してから再作成（上記 7）
- リモート保護: 組織設定によりタグ削除/上書きが制限されることがあります（管理者へ相談）
- 署名エラー: GPG 設定が必要な場合があります（`git config user.signingkey` や `gpg --list-secret-keys` を確認）

### 9. 運用メモ（推奨）

- タグは注釈付き（-a）で作成し、メッセージには関連 PR/Issue を簡潔に記載
- リリース手順を CI で自動化する場合は、`git tag`/`git push --tags` もしくは GitHub Actions の `actions/create-release` などを活用
