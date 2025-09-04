FROM node:24-alpine

WORKDIR /app

# better-sqlite3のネイティブビルドに必要なツールをインストール
RUN apk add --no-cache python3 make g++

# 依存関係をコピーしてインストール
COPY package*.json ./
RUN npm ci

# ソースコードと環境変数をコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# 不要な開発依存関係を削除
RUN npm ci --only=production

# データベースディレクトリを作成
RUN mkdir -p database

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
