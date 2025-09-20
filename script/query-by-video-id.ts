import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index';
import { users } from '../src/db/schema';

// .env.localファイルを読み込み
dotenv.config({ path: '.env.local' });

async function queryUsersByVideoId() {
  try {
    const videoId = process.env.VIDEO_ID;

    if (!videoId) {
      console.error('VIDEO_IDが.env.localに設定されていません');
      process.exit(1);
    }

    console.log(`VIDEO_ID: ${videoId} でユーザーを検索中...`);

    // video_idが一致するユーザーを取得
    const matchedUsers = await db
      .select()
      .from(users)
      .where(eq(users.videoId, videoId));

    // 新しいユーザーデータを準備
    const newUserData = matchedUsers.map(user => ({
      channelId: user.channelId,
      name: user.name,
      timeSec: user.timeSec
    }));

    // 今日の日付をYYYYMMDD形式で取得
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
                   (today.getMonth() + 1).toString().padStart(2, '0') +
                   today.getDate().toString().padStart(2, '0');

    // 出力先ディレクトリとファイルパス
    const outputDir = 'C:\\Users\\aew2s\\work\\public-study-log-page\\data';
    const outputFile = path.join(outputDir, `${dateStr}.json`);

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let result;

    // 既存ファイルが存在するかチェック
    if (fs.existsSync(outputFile)) {
      try {
        // 既存のJSONファイルを読み込み
        const existingData = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));

        // 既存のデータと新しいデータを結合
        result = {
          data: [...(existingData.data || []), ...newUserData]
        };

        console.log(`既存ファイルにデータを追加します: ${outputFile}`);
      } catch (error) {
        console.warn('既存ファイルの読み込みに失敗しました。新しいファイルを作成します。');
        result = { data: newUserData };
      }
    } else {
      result = { data: newUserData };
      console.log(`新しいファイルを作成します: ${outputFile}`);
    }

    // ファイルに出力
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`データを出力しました: ${outputFile}`);
    console.log(`ユーザー数: ${matchedUsers.length}`);

  } catch (error) {
    console.error('データベースクエリエラー:', error);
    process.exit(1);
  }
}

// スクリプトを実行
queryUsersByVideoId().catch(console.error);