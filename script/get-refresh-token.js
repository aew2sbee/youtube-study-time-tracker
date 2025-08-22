const { google } = require('googleapis');
const readline = require('readline');
const dotenv = require('dotenv');

// 環境変数をロード
dotenv.config({ path: '.env.local' });

// 環境変数の検証
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ エラー: GOOGLE_CLIENT_IDとGOOGLE_CLIENT_SECRETが.env.localに設定されている必要があります');
  console.log('📝 以下の環境変数を.env.localファイルに設定してください:');
  console.log('GOOGLE_CLIENT_ID=your_client_id');
  console.log('GOOGLE_CLIENT_SECRET=your_client_secret');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/oauth/callback"
);

// YouTube API のスコープ
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.readonly"
];

console.log('🚀 YouTube OAuth 2.0 リフレッシュトークン取得ツール');
console.log('================================================');

// Next.jsアプリが起動しているかチェック
const http = require('http');

const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.request({ 
      hostname: 'localhost', 
      port: 3000, 
      path: '/api/oauth/callback', 
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      resolve(false);
    });

    req.end();
  });
};

// サーバー起動チェック
(async () => {
  const isServerRunning = await checkServer();

  if (!isServerRunning) {
    console.log('⚠️  警告: Next.jsアプリが起動していません！');
    console.log('📝 別のターミナルで以下のコマンドを実行してください:');
    console.log('   npm run dev');
    console.log('');
    console.log('アプリが起動したら、このスクリプトを再実行してください。');
    process.exit(1);
  }

  console.log('✅ Next.jsアプリが起動していることを確認しました');
})();

// Step 1: 認可URLを生成
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
  include_granted_scopes: true
});

console.log('\n📋 手順:');
console.log('1. 以下のURLをブラウザで開いてください:');
console.log(`\n${authUrl}\n`);
console.log('2. Googleアカウントでログインし、アクセスを許可してください');
console.log('3. 認証完了ページで認証コードが表示されるので、コピーしてください');
console.log('4. 下記に認証コードを入力してください\n');

// Step 2: ユーザー入力を受け取る
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('🔑 認証コードを入力してください: ', async (code) => {
  try {
    console.log('\n⏳ トークンを取得中...');

    const { tokens } = await oauth2Client.getToken(code.trim());

    console.log('\n✅ 成功! トークンを取得しました:');
    console.log('=====================================');
    console.log(`Access Token: ${tokens.access_token?.substring(0, 20)}...`);
    console.log(`Refresh Token: ${tokens.refresh_token}`);
    console.log(`Expires: ${new Date(tokens.expiry_date || 0).toLocaleString()}`);

    console.log('\n📝 .env.localファイルに以下を追加してください:');
    console.log('================================================');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

    if (!tokens.refresh_token) {
      console.log('\n⚠️  警告: refresh_tokenが取得できませんでした。');
      console.log('以下を確認してください:');
      console.log('- Google Cloud Consoleでアプリが「テスト中」ではなく「本番」になっているか');
      console.log('- 以前に同じアカウントで認証していないか');
      console.log('- prompt: "consent" が設定されているか');
    }

  } catch (err) {
    console.error('\n❌ エラーが発生しました:');
    if (err.code === 'invalid_grant') {
      console.error('認証コードが無効か期限切れです。再度URLにアクセスして新しいコードを取得してください。');
    } else {
      console.error(err.message || err);
    }
  }

  rl.close();
});
