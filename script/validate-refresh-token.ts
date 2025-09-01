
import { checkRefreshTokenValidity, ensureValidRefreshToken, getAuthenticatedClient } from '@/utils/googleClient';
import dotenv from 'dotenv';

// 環境変数をロード
dotenv.config({ path: '.env.local' });

async function testRefreshToken() {
  console.log('🧪 Refresh Token自動検証・更新のテスト開始');
  console.log('==========================================');

  // 現在のrefresh tokenの状況を表示
  console.log('📋 現在の状況:');
  console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '設定済み' : '未設定'}`);
  console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '設定済み' : '未設定'}`);
  console.log(`GOOGLE_REFRESH_TOKEN: ${process.env.GOOGLE_REFRESH_TOKEN ? '設定済み' : '未設定'}`);
  console.log('');

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('❌ エラー: GOOGLE_CLIENT_IDとGOOGLE_CLIENT_SECRETが必要です');
    console.log('📝 .env.localファイルに以下を設定してください:');
    console.log('GOOGLE_CLIENT_ID=your_client_id');
    console.log('GOOGLE_CLIENT_SECRET=your_client_secret');
    return;
  }

  // Step 1: Refresh tokenの有効性チェック
  console.log('🔍 Step 1: Refresh tokenの有効性をチェック中...');
  const isValid = await checkRefreshTokenValidity();
  console.log(`結果: ${isValid ? '✅ 有効' : '❌ 無効または未設定'}`);
  console.log('');

  // Step 2: 有効なRefresh tokenを確保
  try {
    console.log('⏳ Step 2: 有効なRefresh tokenを確保中...');
    const refreshToken = await ensureValidRefreshToken();
    console.log('✅ 成功! 有効なRefresh tokenを取得しました');
    console.log(`Refresh Token: ${refreshToken.substring(0, 20)}...`);
    console.log('');
  } catch (error: any) {
    console.log('📋 認証が必要な状況です:');
    console.log(error.message);
    console.log('');
    console.log('🚀 次のステップ:');
    console.log('1. Next.jsアプリを起動: npm run dev');
    console.log('2. 上記のURLをブラウザで開く');
    console.log('3. Google認証を完了する');
    console.log('4. このテストを再実行する');
    return;
  }

  // Step 3: 認証済みクライアントを取得してテスト
  try {
    console.log('🔄 Step 3: 認証済みクライアントを取得してAccess tokenを更新中...');
    const client = await getAuthenticatedClient();
    console.log('✅ 成功! 認証済みクライアントを取得し、Access tokenを更新しました');

    const credentials = client.credentials;
    console.log('📊 認証情報:');
    console.log(`- Access Token: ${credentials.access_token?.substring(0, 20)}...`);
    console.log(`- Token Type: ${credentials.token_type || 'Bearer'}`);
    console.log(`- 有効期限: ${credentials.expiry_date ? new Date(credentials.expiry_date).toLocaleString() : '不明'}`);
    console.log('');
  } catch (error: any) {
    console.log('❌ 認証済みクライアント取得エラー:', error.message);
  }

  console.log('🎉 テスト完了!');
}

testRefreshToken().catch(console.error);
