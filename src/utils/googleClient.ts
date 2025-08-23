import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const OAUTH_CALLBACK_URL = 'http://localhost:3000/api/oauth/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly'
];

const TOKEN_PATH = path.join(process.cwd(), '.env.local');

export function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    OAUTH_CALLBACK_URL,
  );

  if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

export async function getRefreshTokenAutomatically(): Promise<string> {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return process.env.GOOGLE_REFRESH_TOKEN;
  }

  console.log('🔄 Refresh tokenが見つかりません。自動取得を開始します...');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    OAUTH_CALLBACK_URL,
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    include_granted_scopes: true
  });

  console.log('📋 認証が必要です:');
  console.log('1. 以下のURLをブラウザで開いてください:');
  console.log(`\n${authUrl}\n`);
  console.log('2. 認証を完了してください');
  console.log('3. システムが自動でrefresh tokenを取得・保存します\n');

  throw new Error('認証が必要です。上記のURLにアクセスして認証を完了してください。');
}

export async function saveRefreshToken(code: string): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    OAUTH_CALLBACK_URL,
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error('Refresh tokenが取得できませんでした');
    }

    await updateEnvFile('GOOGLE_REFRESH_TOKEN', tokens.refresh_token);

    console.log('✅ Refresh tokenを.env.localに保存しました');
    return tokens.refresh_token;
  } catch (error) {
    console.error('❌ Token取得エラー:', error);
    throw error;
  }
}

export async function validateRefreshToken(): Promise<boolean> {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return false;
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (credentials.access_token) {
      console.log('✅ Refresh tokenは有効です');
      return true;
    }

    return false;
  } catch (error: unknown) {
    const err = error as Error & { code?: string; message?: string };
    console.log('❌ Refresh tokenが無効になっています:', err.message);

    if (err.code === 'invalid_grant' || err.message?.includes('invalid_grant')) {
      console.log('🔄 Refresh tokenを削除して再認証を促します...');
      await removeInvalidRefreshToken();
    }

    return false;
  }
}

export async function ensureValidRefreshToken(): Promise<string> {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    console.log('🔍 Refresh tokenが設定されていません');
    return await getRefreshTokenAutomatically();
  }

  const isValid = await validateRefreshToken();

  if (!isValid) {
    console.log('🔄 無効なRefresh tokenが検出されました。再認証を開始します...');
    return await getRefreshTokenAutomatically();
  }

  return process.env.GOOGLE_REFRESH_TOKEN;
}

export async function refreshAccessTokenSafely() {
  try {
    const oauth2Client = getOAuth2Client();
    const { credentials } = await oauth2Client.refreshAccessToken();

    oauth2Client.setCredentials(credentials);

    console.log('🔄 Access tokenを更新しました');
    return oauth2Client;
  } catch (error: unknown) {
    const err = error as Error & { code?: string; message?: string };
    console.error('❌ Access token更新エラー:', err.message);

    if (err.code === 'invalid_grant') {
      console.log('🔄 Refresh tokenが無効です。再認証が必要です。');
      await removeInvalidRefreshToken();
      throw new Error('認証が必要です。Refresh tokenが無効になっています。');
    }

    throw err;
  }
}

/**
 * Refresh tokenを自動的に取得・設定するユーティリティ（レガシー）
 * @deprecated 代わりに ensureValidRefreshToken() を使用してください
 */
export async function ensureRefreshToken(): Promise<string> {
  console.warn('⚠️  ensureRefreshToken() は非推奨です。ensureValidRefreshToken() を使用してください。');
  return await ensureValidRefreshToken();
}

/**
 * Refresh tokenの有効性をチェック
 */
export async function checkRefreshTokenValidity(): Promise<boolean> {
  return await validateRefreshToken();
}

/**
 * 認証済みのGoogleクライアントを取得
 * refresh tokenの有効性をチェックし、必要に応じて更新
 */
export async function getAuthenticatedClient() {
  await ensureValidRefreshToken();
  return await refreshAccessTokenSafely();
}

/**
 * 安全にAccess tokenを更新
 * Refresh tokenが無効な場合は自動で再認証を促す
 */
export async function refreshTokenSafely() {
  return await refreshAccessTokenSafely();
}

async function removeInvalidRefreshToken(): Promise<void> {
  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      return;
    }

    let envContent = fs.readFileSync(TOKEN_PATH, 'utf8');

    envContent = envContent
      .split('\n')
      .filter((line) => !line.startsWith('GOOGLE_REFRESH_TOKEN='))
      .join('\n');

    fs.writeFileSync(TOKEN_PATH, envContent);
    delete process.env.GOOGLE_REFRESH_TOKEN;

    console.log('🗑️  無効なRefresh tokenを削除しました');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Refresh token削除エラー:', err);
  }
}

async function updateEnvFile(key: string, value: string): Promise<void> {
  try {
    let envContent = '';

    if (fs.existsSync(TOKEN_PATH)) {
      envContent = fs.readFileSync(TOKEN_PATH, 'utf8');
    }

    const keyPattern = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;

    if (keyPattern.test(envContent)) {
      envContent = envContent.replace(keyPattern, newLine);
    } else {
      envContent = envContent.trim();
      if (envContent) {
        envContent += '\n';
      }
      envContent += newLine;
    }

    fs.writeFileSync(TOKEN_PATH, envContent);
    process.env[key] = value;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ .env.local更新エラー:', err);
    throw err;
  }
}

/**
 * 使用例:
 *
 * // 推奨: 有効なRefresh tokenを確保
 * import { ensureValidRefreshToken } from '@/utils/googleClient';
 * await ensureValidRefreshToken();
 *
 * // 認証済みクライアントを直接取得
 * import { getAuthenticatedClient } from '@/utils/googleClient';
 * const oauth2Client = await getAuthenticatedClient();
 *
 * // Refresh tokenの有効性チェック
 * import { checkRefreshTokenValidity } from '@/utils/googleClient';
 * const isValid = await checkRefreshTokenValidity();
 */
