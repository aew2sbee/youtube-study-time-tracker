# ベースイメージとしてNode.jsを使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY ./obs-overlay-app/package.json ./obs-overlay-app/package-lock.json* ./ 

# 依存関係をインストール
RUN npm install

# アプリケーションコードをコピー
COPY ./obs-overlay-app .

# ビルドを実行
RUN npm run build

# アプリケーションを実行するポートを指定
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]
