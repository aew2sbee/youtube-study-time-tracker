# ベースイメージとしてNode.jsを使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY ./package.json ./package-lock.json* ./

# 依存関係をインストール
RUN npm install --production

# アプリケーションコードをコピー
COPY . .

# ビルドを実行
RUN npm run build

# アプリケーションを実行するポートを指定
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]
