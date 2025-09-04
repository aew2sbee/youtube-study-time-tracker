# ブランチ整理

- [GitHub branches 一覧](https://github.com/aew2sbee/youtube-study-time-tracker/branches)

## リモート参照の整理

```bash
# 削除される内容を確認
git remote prune origin --dry-run

# リモート参照を削除
git remote prune origin
```

## ローカルブランチの整理

```bash
# マージ済みブランチを確認
git branch --merged

# ブランチを削除
git branch -d <branch-name>
```

## まとめて実行

```bash
git remote prune origin
git branch --merged
git branch -d <branch-name>
```
