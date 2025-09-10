# タスク: [FEATURE NAME]

**入力元**: `/specs/[###-feature-name]/` 配下の設計ドキュメント
**前提条件**: plan.md (必須), research.md, data-model.md, contracts/

## 実行フロー (main)

```
1. 機能ディレクトリから plan.md を読み込む
   → 見つからない場合: ERROR "No implementation plan found"（実装計画が無い）
   → 抽出: 技術スタック / 利用ライブラリ / 構造
2. 任意の設計ドキュメントを読み込む:
   → data-model.md: エンティティ抽出 → モデル作成タスク生成
   → contracts/: 各ファイル → コントラクトテストタスク生成
   → research.md: 意思決定抽出 → セットアップ系タスク生成
3. カテゴリ別にタスクを生成:
   → Setup: 初期化, 依存関係, Lint/Format
   → Tests: コントラクトテスト, 統合テスト
   → Core: モデル, サービス, CLI コマンド
   → Integration: DB, ミドルウェア, ロギング
   → Polish: ユニットテスト, パフォーマンス, ドキュメント
4. タスクリールを適用:
   → 異なるファイル = 並列可として [P]
   → 同一ファイル = 逐次 ( [P] 付与しない )
   → 実装前にテスト (TDD)
5. タスクに連番を付与 (T001, T002 ...)
6. 依存関係グラフを生成
7. 並列実行例を生成
8. タスク網羅性を検証:
   → すべてのコントラクトにテストがあるか
   → すべてのエンティティにモデルがあるか
   → すべてのエンドポイントが実装対象か
9. 戻り値: SUCCESS (実行可能なタスクセット)
```

## フォーマット: `[ID] [P?] 説明`

- **[P]**: 並列実行可能 (異なるファイルで依存なし)
- 説明内に正確なファイルパスを含めること

## パス規約

- **単一プロジェクト**: リポジトリ直下に `src/`, `tests/`
- **Web アプリ**: `backend/src/`, `frontend/src/`
- **モバイル**: `api/src/`, `ios/src/` または `android/src/`
- 以下の例は単一プロジェクト前提。plan.md の構造に合わせて調整すること

## フェーズ 3.1: セットアップ

- [ ] T001 実装計画に基づくプロジェクト構造の作成
- [ ] T002 [language] プロジェクト初期化 + [framework] 依存関係導入
- [ ] T003 [P] Lint / Format ツール設定

## フェーズ 3.2: 先にテスト (TDD) ⚠️ 3.3 開始前に完了必須

**重要: これらのテストは必ず先に作成し、実装前は FAIL であること**

- [ ] T004 [P] コントラクトテスト POST /api/users (tests/contract/test_users_post.py)
- [ ] T005 [P] コントラクトテスト GET /api/users/{id} (tests/contract/test_users_get.py)
- [ ] T006 [P] 統合テスト: ユーザー登録 (tests/integration/test_registration.py)
- [ ] T007 [P] 統合テスト: 認証フロー (tests/integration/test_auth.py)

## フェーズ 3.3: コア実装 (テストが FAIL 状態になってから着手)

- [ ] T008 [P] User モデル作成 (src/models/user.py)
- [ ] T009 [P] UserService CRUD 実装 (src/services/user_service.py)
- [ ] T010 [P] CLI --create-user 実装 (src/cli/user_commands.py)
- [ ] T011 POST /api/users エンドポイント
- [ ] T012 GET /api/users/{id} エンドポイント
- [ ] T013 入力バリデーション
- [ ] T014 エラーハンドリング & ロギング

## フェーズ 3.4: インテグレーション

- [ ] T015 UserService と DB 接続
- [ ] T016 認証ミドルウェア
- [ ] T017 リクエスト/レスポンス ロギング
- [ ] T018 CORS & セキュリティヘッダー設定

## フェーズ 3.5: 仕上げ (Polish)

- [ ] T019 [P] バリデーション用ユニットテスト (tests/unit/test_validation.py)
- [ ] T020 パフォーマンステスト (<200ms 目標)
- [ ] T021 [P] ドキュメント更新 (docs/api.md)
- [ ] T022 重複コード除去
- [ ] T023 manual-testing.md 実行確認

## 依存関係

- 実装 (T008-T014) より前にテスト (T004-T007)
- T008 が T009, T015 をブロック
- T016 が T018 をブロック
- 実装フェーズ完了後に仕上げ (T019-T023)

## 並列実行例

```
# T004〜T007 を同時に開始:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## 注意事項

- [P] タスク = 異なるファイル & 依存なし
- 実装前に必ずテストが FAIL していることを確認
- 各タスク完了ごとにコミット
- 避ける: 抽象的な説明 / 同一ファイル競合

## タスク自動生成ルール

_main() 実行中に適用_

1. **Contracts 由来**:
   - 各コントラクトファイル → コントラクトテストタスク [P]
   - 各エンドポイント → 実装タスク
2. **データモデル由来**:
   - 各エンティティ → モデル作成タスク [P]
   - リレーション → サービス層タスク
3. **ユーザーストーリー由来**:

   - 各ストーリー → 統合テスト [P]
   - クイックスタートシナリオ → バリデーションタスク

4. **順序**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - 依存関係が並列実行をブロック

## バリデーションチェックリスト

_GATE: main() 戻り前に検査_

- [ ] 全コントラクトに対応するテストがある
- [ ] 全エンティティにモデルタスクがある
- [ ] すべてのテストが実装タスクより前に並んでいる
- [ ] 並列タスクは真に独立
- [ ] 各タスクが正確なファイルパスを含む
- [ ] 同一ファイルを変更する [P] タスクの競合が無い
