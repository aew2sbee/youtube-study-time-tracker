# 開発フロー（ガイド）

本リポジトリでの典型的な開発〜リリースまでの流れをまとめます。状況に合わせて柔軟に運用してください。

## ブランチ戦略

- main: 本番リリース用。タグ付けされた安定版のみが入る想定。
- develop: 開発の集約ブランチ。通常の PR はここへマージ。
- トピックブランチ（例）:
  - feat/<summary>: 機能追加
  - fix/<summary>: バグ修正
  - chore/<summary>: ビルドや設定などの雑務
  - docs/<summary>: ドキュメント
  - test/<summary>: テスト強化
  - hotfix/<summary>: 本番急ぎ修正（main 起点、後述）

命名例

- feat/user-total-time
- fix/youtube-top-level-await
- chore/release-doc

## 1. Issue 作成 → ブランチ作成

- 変更内容と受け入れ条件（テスト観点）を Issue に記載。
- develop からトピックブランチを作成。

```bash
git checkout develop
git pull --ff-only
git checkout -b feat/user-total-time
```

## 2. 実装とコミット規約

- 可能な限りテストを先に（ユニットテスト最小 1 本 + 境界 1 本）。
- コミットメッセージは Conventional Commits 推奨:
  - feat: 機能追加
  - fix: バグ修正
  - chore:, docs:, refactor:, test:, perf: など

例

```bash
git commit -m "feat(db): add getTotalTimeSec and tests"
```

## 3. テスト・DB マイグレーション

- テスト実行

```bash
npm test
```

- Drizzle のマイグレーション適用（ローカル）

```bash
npx drizzle-kit push
```

- 注意: `database/**` は `.gitignore` でコミット対象外。追跡解除は `git rm -r --cached database`。

## 4. PR 作成（→ develop）

- PR タイトル: 変更の要約（必要なら Conventional Commits に準拠）。
- 説明: 目的 / 変更点 / 動作確認手順 / スクショ or ログ / 影響範囲 / テスト観点。
- チェックリスト例:
  - [ ] テスト追加・更新済み
  - [ ] 型エラー・Lint なし
  - [ ] マイグレーション適用確認（必要時）
  - [ ] 機能の回帰影響を自己確認

## 5. レビューとマージ

- レビュー指摘はコミットで対応し、必要に応じて再リクエスト。
- マージ方法はチーム方針に従う（Squash 推奨）。

## 6. リリース（タグ運用）

- develop の内容を main に取り込み → タグ付けして公開。
- タグ付け手順は「タグを使ったリリース手順」を参照。
  - docs/GitHub/tags-release.md
  - 例）特定コミット `c686c24` に v1.0.0 を付与
    ```bash
    git fetch --all --tags
    git tag -a v1.0.0 c686c24 -m "v1.0.0 (#20)"
    git push origin v1.0.0
    ```
- GitHub Releases は Web UI または `gh release create` で作成可。

### リリースフロー（Mermaid）

```mermaid
flowchart TD
  A[Issue 作成] --> B[feature/fix ブランチ作成]
  B --> C[実装 + テスト]
  C --> D[PR → develop]
  D --> E{レビューOK?}
  E -- No --> C
  E -- Yes --> F[develop にマージ]
  F --> G[main へ取り込み]
  G --> H[タグ作成 (例: v1.0.0)]
  H --> I[タグを push]
  I --> J[GitHub Releases 公開]

  subgraph Hotfix
    H1[main から hotfix/<name> 作成] --> H2[修正 + テスト]
    H2 --> H3[PR → main]
    H3 --> H4[main にマージ]
    H4 --> H5[パッチタグ作成 (例: v1.0.1)]
    H5 --> H6[タグを push → Releases]
    H6 --> H7[develop へ取り込み]
  end
```

## 7. バージョニング（SemVer）

- MAJOR: 互換性の破壊を伴う変更
- MINOR: 後方互換な機能追加
- PATCH: バグ修正
- コミット履歴から自動判定したい場合はツール導入を検討（semantic-release 等）。

## 8. ホットフィックス（本番緊急修正）

1. main から hotfix ブランチを作成

```bash
git checkout main
git pull --ff-only
git checkout -b hotfix/login-crash
```

2. 修正・テスト後、main へ PR → マージ
3. パッチタグ作成（例: v1.0.1）→ プッシュ

```bash
git tag -a v1.0.1 -m "fix: login crash"
git push origin v1.0.1
```

4. 同修正を develop にも取り込む（main → develop へマージまたは同修正を cherry-pick）

## 9. 品質ゲート（推奨）

- Lint/Typecheck/Unit Test を CI で必須化
- 変更が大きい場合は e2e/結合テストを検討
- ログ・エラーの監視（本番リリース後）

## 10. 開発のヒント

- API/外部依存はテストでモックする（トップレベル await 問題回避など）
- 共通パラメータ（例: VIDEO_ID）は util に切り出すか、テストでは仮想モックで固定
- 返却配列の空ケースを考慮し、境界条件にテストを追加
- 大きめ変更は段階的に PR を分割

---

更新履歴

- 2025-09-02: 初版作成
