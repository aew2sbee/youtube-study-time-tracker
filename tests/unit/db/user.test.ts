import { users } from '@/db/schema';
import { SAMPLE_USER_001 } from '@/../tests/mock/user';
type UserRow = typeof users.$inferSelect;

type MockDb = {
  update: jest.Mock;
  insert: jest.Mock;
  select: jest.Mock;
};

// 実装が参照する環境変数（insert/hasUser で使用）を固定
const SAMPLE_VIDEO_ID = 'testVideoId';

let mockedDb: MockDb;
let userDb: typeof import('@/db/user');

// テスト時にログ出力でノイズが出ないよう、logger を無音化する
jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Drizzle の db を完全モック化する
// ・各 test 内で必要なチェーン（insert/values/returning など）だけを都度組み立てる
jest.mock('@/db', () => {
  return {
    db: {
      update: jest.fn(),
      insert: jest.fn(),
      select: jest.fn(),
    },
  };
});

// トップレベル await を含む実ファイルを読みに行かないよう、VIDEO_ID を返す仮想モックを定義
// 注意: jest は jest.mock 呼び出しをホイストするため、工場関数内で外部変数を参照しない
jest.mock('@/app/api/youtube/route', () => ({ VIDEO_ID: SAMPLE_VIDEO_ID }));

describe('db/user', () => {
  // モックデータ（tests/mock/user.ts）を使用
  beforeEach(async () => {
    // 直前のテストで仕込んだモック呼び出し状態をクリア
    jest.clearAllMocks();
    // ESM の import キャッシュをリセットし、テストごとに新鮮なモジュールを読み込む
    jest.resetModules();
    // 被テスト対象を動的 import（mock 初期化後に読み込むのがポイント）
    userDb = await import('@/db/user');
    // jest.mock('@/db') で作ったモックの参照を取得
    const dbModule = await import('@/db');
    mockedDb = dbModule.db as unknown as MockDb;
  });

  describe('insertUser', () => {
    it('db.insert(...).values(...).returning() の結果を返す', async () => {
      // returning() が返す行を用意
      const returning: UserRow[] = [
        {
          id: 20,
          channelId: SAMPLE_USER_001.channelId,
          name: SAMPLE_USER_001.name,
          timeSec: SAMPLE_USER_001.timeSec,
          videoId: SAMPLE_VIDEO_ID,
        },
      ];

      // drizzle チェーンのモック構造
      // db.insert(users) -> { values(fn) } -> { returning(fn) }
      const returningFn = jest.fn<Promise<UserRow[]>, []>().mockResolvedValue(returning);
      const values = jest.fn().mockReturnValue({ returning: returningFn });
      (mockedDb.insert as jest.Mock).mockReturnValue({ values });

      const res = await userDb.insertUser({ ...SAMPLE_USER_001 });

      // values の引数に VIDEO_ID が入っているかも確認
      expect(values).toHaveBeenCalledWith({
        channelId: SAMPLE_USER_001.channelId,
        name: SAMPLE_USER_001.name,
        timeSec: SAMPLE_USER_001.timeSec,
        videoId: SAMPLE_VIDEO_ID,
      }); // values(...) に VIDEO_ID を含む正しいデータが渡されたこと
      expect(returningFn).toHaveBeenCalledTimes(1); // returning() が 1 回呼ばれたこと（チェーンの終端が実行されたこと）
      expect(res).toEqual(returning); // insertUser の戻り値が returning() の返却配列と一致すること
    });
  });

  describe('updateTimeSec', () => {
    it('db.update(...).set(...).where(...).returning() の結果を返す', async () => {
      // returning() が返す行を用意
      const returning: UserRow[] = [
        {
          id: 30,
          channelId: SAMPLE_USER_001.channelId,
          name: SAMPLE_USER_001.name,
          timeSec: 1000,
          videoId: SAMPLE_VIDEO_ID,
        },
      ];

      // drizzle チェーンのモック構造
      // db.update(users) -> { set(fn) } -> { where(fn) } -> { returning(fn) }
      const returningFn = jest.fn<Promise<UserRow[]>, []>().mockResolvedValue(returning);
      const where = jest.fn().mockReturnValue({ returning: returningFn });
      const set = jest.fn().mockReturnValue({ where });
      (mockedDb.update as jest.Mock).mockReturnValue({ set });

      const res = await userDb.updateTimeSec({ ...SAMPLE_USER_001, timeSec: 1000 }, 30);

      expect(set).toHaveBeenCalledWith({ timeSec: 1000 }); // set(...) で timeSec のみが期待値で更新されること
      expect(where).toHaveBeenCalledTimes(1); // where(...) が 1 回呼ばれていること（更新対象を絞っていること）
      expect(returningFn).toHaveBeenCalledTimes(1); // returning() が 1 回呼ばれたこと
      expect(res).toEqual(returning); // updateTimeSec の戻り値が returning() の返却配列と一致すること
    });

    it('id が一致しない場合は空配列を返す', async () => {
      // returning() が空配列を返す（更新対象行が存在しない想定）
      const returningFn = jest.fn<Promise<UserRow[]>, []>().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ returning: returningFn });
      const set = jest.fn().mockReturnValue({ where });
      (mockedDb.update as jest.Mock).mockReturnValue({ set });

      const res = await userDb.updateTimeSec({ ...SAMPLE_USER_001, timeSec: 999 }, /* not matching id */ 99999);

      expect(set).toHaveBeenCalledWith({ timeSec: 999 }); // 指定の timeSec で更新しようとしていること
      expect(where).toHaveBeenCalledTimes(1); // where で id 条件を付与していること
      expect(returningFn).toHaveBeenCalledTimes(1); // returning() が実行されていること
      expect(res).toEqual([]); // 更新対象がなく、空配列が返ること
    });
  });

  describe('hasUser', () => {
    it('データが1件だけ結果を返す', async () => {
      // hasUser は select({id}).from(users).where(...).limit(1) の結果を返す
      const expected: Array<Pick<UserRow, 'id'>> = [{ id: 77 }];

      // drizzle チェーンのモック構造
      // db.select(...) -> { from(fn) } -> { where(fn) } -> { limit(fn) }
      const limit = jest.fn().mockResolvedValue(expected);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (mockedDb.select as jest.Mock).mockReturnValue({ from });

      const res = await userDb.hasUser({ ...SAMPLE_USER_001 });

      expect(from).toHaveBeenCalledTimes(1); // select(...).from(...) が 1 回呼ばれたこと
      expect(where).toHaveBeenCalledTimes(1); // where(...) が 1 回呼ばれたこと（条件で絞っていること）
      expect(limit).toHaveBeenCalledWith(1); // limit(1) が指定されていること
      expect(res).toEqual(expected); // hasUser の戻り値が期待の {id} 配列であること
    });

    it('channelId は一致するが videoId が一致しない場合は空配列を返す', async () => {
      // モジュールキャッシュをリセットし、VIDEO_ID を異なる値に差し替えた環境で実装を読み込む
      jest.resetModules();
      jest.doMock('@/app/api/youtube/route', () => ({ VIDEO_ID: 'differentVideoId' }), { virtual: true });

      // drizzle の db モックを取得して、空配列を返すチェーンを準備
      const dbModuleLocal = await import('@/db');
      const mockedDbLocal = dbModuleLocal.db as unknown as MockDb;
      const limit = jest.fn<Promise<Array<Pick<UserRow, 'id'>>>, [number]>().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (mockedDbLocal.select as jest.Mock).mockReturnValue({ from });

      // VIDEO_ID が異なる状態で実装を読み込み直す
      const userDbLocal = await import('@/db/user');
      const res = await userDbLocal.hasUser({ ...SAMPLE_USER_001 });

      expect(from).toHaveBeenCalledTimes(1); // from が呼ばれていること
      expect(where).toHaveBeenCalledTimes(1); // where が呼ばれていること
      expect(limit).toHaveBeenCalledWith(1); // limit(1) が指定されていること
      expect(res).toEqual([]); // videoId 不一致のため該当なし（空配列）
    });

    it('channelId は一致しないが videoId は一致する場合は空配列を返す', async () => {
      // VIDEO_ID はグローバルモックのまま一致させ、channelId のみ異なるユーザーを検索する
      const userWithDifferentChannel = { ...SAMPLE_USER_001, channelId: 'anotherChannel' };

      // drizzle チェーンをモックして空配列を返す
      const limit = jest.fn<Promise<Array<Pick<UserRow, 'id'>>>, [number]>().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (mockedDb.select as jest.Mock).mockReturnValue({ from });

      const res = await userDb.hasUser(userWithDifferentChannel);

      expect(from).toHaveBeenCalledTimes(1); // from が呼ばれていること
      expect(where).toHaveBeenCalledTimes(1); // where が呼ばれていること
      expect(limit).toHaveBeenCalledWith(1); // limit(1) が指定されていること
      expect(res).toEqual([]); // channelId 不一致のため該当なし（空配列）
    });

    it('channelId も videoId も一致しない場合は空配列を返す', async () => {
      // VIDEO_ID を別値に差し替え、かつ channelId も異なるユーザーで検索する
      jest.resetModules();
      jest.doMock('@/app/api/youtube/route', () => ({ VIDEO_ID: 'yetAnotherVideoId' }), { virtual: true });

      const dbModuleLocal = await import('@/db');
      const mockedDbLocal = dbModuleLocal.db as unknown as MockDb;
      const limit = jest.fn<Promise<Array<Pick<UserRow, 'id'>>>, [number]>().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (mockedDbLocal.select as jest.Mock).mockReturnValue({ from });

      const userDbLocal = await import('@/db/user');
      const res = await userDbLocal.hasUser({ ...SAMPLE_USER_001, channelId: 'completelyDifferentCh' });

      expect(from).toHaveBeenCalledTimes(1); // from が呼ばれていること
      expect(where).toHaveBeenCalledTimes(1); // where が呼ばれていること
      expect(limit).toHaveBeenCalledWith(1); // limit(1) が指定されていること
      expect(res).toEqual([]); // channelId と videoId の両方で不一致のため該当なし
    });
  });

  describe('saveUser', () => {
    it('既存ユーザーがいる場合は updateTimeSec を呼ぶ', async () => {
      // hasUser が 1 件見つかったことにする
      const existing: Array<Pick<UserRow, 'id'>> = [{ id: 10 }];
      // update の戻り値（updateTimeSec が返すべき行）
      const updated: UserRow[] = [
        {
          id: 10,
          channelId: SAMPLE_USER_001.channelId,
          name: SAMPLE_USER_001.name,
          timeSec: SAMPLE_USER_001.timeSec,
          videoId: SAMPLE_VIDEO_ID,
        },
      ];

      // saveUser 内で呼ばれる自前関数を spy して期待の戻り値に差し替える
      const spyHas = jest.spyOn(userDb, 'hasUser').mockResolvedValue(existing);
      const spyUpdate = jest.spyOn(userDb, 'updateTimeSec').mockResolvedValue(updated);
      const spyInsert = jest.spyOn(userDb, 'insertUser').mockResolvedValue([
        {
          id: 99,
          channelId: SAMPLE_USER_001.channelId,
          name: SAMPLE_USER_001.name,
          timeSec: SAMPLE_USER_001.timeSec,
          videoId: SAMPLE_VIDEO_ID,
        },
      ] as UserRow[]);

      const res = await userDb.saveUser({ ...SAMPLE_USER_001 });

      // 既存がいるので update が呼ばれ、insert は呼ばれない
      expect(spyHas).toHaveBeenCalledTimes(1); // saveUser 内で hasUser が 1 回呼ばれていること
      expect(spyUpdate).toHaveBeenCalledWith({ ...SAMPLE_USER_001 }, 10); // 既存ユーザーの id=10 で updateTimeSec が呼ばれたこと
      expect(spyInsert).not.toHaveBeenCalled(); // 既存がいる場合は insertUser が呼ばれないこと
      expect(res).toEqual(updated); // saveUser の戻り値が update の結果であること
    });

    it('既存ユーザーがいない場合は insertUser を呼ぶ', async () => {
      // hasUser が空（未登録）
      const inserted: UserRow[] = [
        {
          id: 11,
          channelId: SAMPLE_USER_001.channelId,
          name: SAMPLE_USER_001.name,
          timeSec: SAMPLE_USER_001.timeSec,
          videoId: SAMPLE_VIDEO_ID,
        },
      ];

      const spyHas = jest.spyOn(userDb, 'hasUser').mockResolvedValue([]);
      const spyUpdate = jest.spyOn(userDb, 'updateTimeSec').mockResolvedValue([
        {
          id: 1,
          channelId: SAMPLE_USER_001.channelId,
          name: SAMPLE_USER_001.name,
          timeSec: SAMPLE_USER_001.timeSec,
          videoId: SAMPLE_VIDEO_ID,
        },
      ] as UserRow[]);
      const spyInsert = jest.spyOn(userDb, 'insertUser').mockResolvedValue(inserted);

      const res = await userDb.saveUser({ ...SAMPLE_USER_001 });

      // 未登録なので insert が呼ばれ、update は呼ばれない
      expect(spyHas).toHaveBeenCalledTimes(1); // hasUser が 1 回呼ばれていること
      expect(spyInsert).toHaveBeenCalledWith({ ...SAMPLE_USER_001 }); // 未登録時は insertUser が引数のユーザーで呼ばれること
      expect(spyUpdate).not.toHaveBeenCalled(); // 未登録時は updateTimeSec が呼ばれないこと
      expect(res).toEqual(inserted); // saveUser の戻り値が insert の結果であること
    });
  });

  describe('getTotalTimeSec', () => {
    it('同一channelIdのtimeSec合計を返す', async () => {
      // 同一 channelId に紐づく行の timeSec を合計する
      const rows = [{ timeSec: 10 }, { timeSec: 20 }, { timeSec: 5 }];

      // db.select(...).from(...).where(...) -> rows を返すようにモック
      const where = jest.fn<Promise<Array<{ timeSec: number }>>, [unknown]>().mockResolvedValue(rows);
      const from = jest.fn().mockReturnValue({ where });
      (mockedDb.select as jest.Mock).mockReturnValue({ from });

      const total = await userDb.getTotalTimeSec(SAMPLE_USER_001.channelId);

      expect(mockedDb.select).toHaveBeenCalledTimes(1); // select(...) が 1 回呼ばれていること
      expect(from).toHaveBeenCalledTimes(1); // from(...) が 1 回呼ばれていること
      expect(where).toHaveBeenCalledTimes(1); // where(...) が 1 回呼ばれていること
      expect(total).toBe(35); // 取得した行の timeSec 合計が 35 になること (10+20+5)
    });

    it('存在しないchannelIdなら0を返す', async () => {
      // 対象の channelId に一致する行が 0 件の場合
      const rows: Array<{ timeSec: number }> = [];

      // db.select(...).from(...).where(...) -> 空配列を返すようにモック
      const where = jest.fn<Promise<Array<{ timeSec: number }>>, [unknown]>().mockResolvedValue(rows);
      const from = jest.fn().mockReturnValue({ where });
      (mockedDb.select as jest.Mock).mockReturnValue({ from });

      const total = await userDb.getTotalTimeSec('nonExistChannel');

      expect(mockedDb.select).toHaveBeenCalledTimes(1); // select(...) が 1 回呼ばれていること
      expect(from).toHaveBeenCalledTimes(1); // from(...) が 1 回呼ばれていること
      expect(where).toHaveBeenCalledTimes(1); // where(...) が 1 回呼ばれていること
      expect(total).toBe(0); // レコードがないので合計は 0 であること
    });
  });
});
