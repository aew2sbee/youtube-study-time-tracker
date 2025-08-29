import type { Config } from 'jest';

const config: Config = {
  // TypeScript を Jest で扱うためのプリセット
  preset: 'ts-jest',
  // テスト実行環境（Node.js）
  testEnvironment: 'node',
  // テストルートディレクトリ（tests 配下のみを探索）
  roots: ['<rootDir>/tests'],
  // 解決する拡張子の一覧
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // ts/tsx を ts-jest でトランスパイルして実行
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  // import パスのエイリアス（@/xxx -> src/xxx）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // 各テスト前に読み込むセットアップ（今回は不要のため空）
  setupFilesAfterEnv: [],
  // テストファイルのマッチパターン
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  // 自動で mock をクリア
  clearMocks: true,
  // カバレッジ取得対象のデフォルト設定
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};

export default config;
