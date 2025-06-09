# YouTube 勉強時間のカウントアプリ

## Docker イメージの実行

```bash
cd obs-overlay-app/
docker build -t obs-overlay-app .
```

## Docker コンテナの実行

```bash
cd obs-overlay-app/
docker run -p 3000:3000 obs-overlay-app
```
