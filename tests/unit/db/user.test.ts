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

// schema は実物そのまま（型を得るために使用）。実 DB 操作は行わない
import { users } from '@/db/schema';
// ユーザモック（tests/mock/user.ts）をそのまま利用してテストデータを一元化
import { SAMPLE_USER } from '@/../tests/mock/user';
type UserRow = typeof users.$inferSelect;

type MockDb = {
  update: jest.Mock;
  insert: jest.Mock;
  select: jest.Mock;
};
let mockedDb: MockDb;
let userDb: typeof import('@/db/user');

describe('db/user', () => {
  // モックデータ（tests/mock/user.ts）を使用
  // const baseUser = SAMPLE_USER;

  beforeEach(async () => {
    // 直前のテストで仕込んだモック呼び出し状態をクリア
    jest.clearAllMocks();
    // ESM の import キャッシュをリセットし、テストごとに新鮮なモジュールを読み込む
    jest.resetModules();
    // 実装が参照する環境変数（insert/hasUser で使用）を固定
    process.env.VIDEO_ID = 'vid_123';
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
          channelId: SAMPLE_USER.channelId,
          name: SAMPLE_USER.name,
          timeSec: SAMPLE_USER.timeSec,
          videoId: 'vid_123',
        },
      ];

      // drizzle チェーンのモック構造
      // db.insert(users) -> { values(fn) } -> { returning(fn) }
      const returningFn = jest.fn<Promise<UserRow[]>, []>().mockResolvedValue(returning);
      const values = jest.fn().mockReturnValue({ returning: returningFn });
      (mockedDb.insert as jest.Mock).mockReturnValue({ values });

      const res = await userDb.insertUser({ ...SAMPLE_USER });

      // values の引数に VIDEO_ID が入っているかも確認
      expect(values).toHaveBeenCalledWith({
        channelId: SAMPLE_USER.channelId,
        name: SAMPLE_USER.name,
        timeSec: SAMPLE_USER.timeSec,
        videoId: process.env.VIDEO_ID,
      });
      expect(returningFn).toHaveBeenCalledTimes(1);
      expect(res).toEqual(returning);
    });
  });

  // describe('saveUser', () => {
  //   it('既存ユーザーがいる場合は updateTimeSec を呼ぶ', async () => {
  //     // hasUser が 1 件見つかったことにする
  //     const existing: Array<Pick<UserRow, 'id'>> = [{ id: 10 }];
  //     // update の戻り値（updateTimeSec が返すべき行）
  //     const updated: UserRow[] = [
  //       {
  //         id: 10,
  //         channelId: SAMPLE_USER.channelId,
  //         name: SAMPLE_USER.name,
  //         timeSec: SAMPLE_USER.timeSec,
  //         videoId: 'vid_123',
  //       },
  //     ];

  //     // saveUser 内で呼ばれる自前関数を spy して期待の戻り値に差し替える
  //     const spyHas = jest.spyOn(userDb, 'hasUser').mockResolvedValue(existing);
  //     const spyUpdate = jest.spyOn(userDb, 'updateTimeSec').mockResolvedValue(updated);
  //     const spyInsert = jest
  //       .spyOn(userDb, 'insertUser')
  //       .mockResolvedValue([
  //         { id: 99, channelId: SAMPLE_USER.channelId, name: SAMPLE_USER.name, timeSec: SAMPLE_USER.timeSec, videoId: 'vid_123' },
  //       ] as UserRow[]);

  //     const res = await userDb.saveUser({ ...SAMPLE_USER });

  //     // 既存がいるので update が呼ばれ、insert は呼ばれない
  //     expect(spyHas).toHaveBeenCalledTimes(1);
  //     expect(spyUpdate).toHaveBeenCalledWith({ ...SAMPLE_USER }, 10);
  //     expect(spyInsert).not.toHaveBeenCalled();
  //     expect(res).toEqual(updated);
  //   });

  //   it('既存ユーザーがいない場合は insertUser を呼ぶ', async () => {
  //     // hasUser が空（未登録）
  //     const inserted: UserRow[] = [
  //       {
  //         id: 11,
  //         channelId: baseUser.channelId,
  //         name: baseUser.name,
  //         timeSec: baseUser.timeSec,
  //         videoId: 'vid_123',
  //       },
  //     ];

  //     const spyHas = jest.spyOn(userDb, 'hasUser').mockResolvedValue([]);
  //     const spyUpdate = jest
  //       .spyOn(userDb, 'updateTimeSec')
  //       .mockResolvedValue([
  //         { id: 1, channelId: baseUser.channelId, name: baseUser.name, timeSec: baseUser.timeSec, videoId: 'vid_123' },
  //       ] as UserRow[]);
  //     const spyInsert = jest.spyOn(userDb, 'insertUser').mockResolvedValue(inserted);

  //     const res = await userDb.saveUser({ ...baseUser });

  //     // 未登録なので insert が呼ばれ、update は呼ばれない
  //     expect(spyHas).toHaveBeenCalledTimes(1);
  //     expect(spyInsert).toHaveBeenCalledWith({ ...baseUser });
  //     expect(spyUpdate).not.toHaveBeenCalled();
  //     expect(res).toEqual(inserted);
  //   });
  // });



  // describe('updateTimeSec', () => {
  //   it('db.update(...).set(...).where(...).returning() の結果を返す', async () => {
  //     // returning() が返す行を用意
  //     const returning: UserRow[] = [
  //       {
  //         id: 30,
  //         channelId: baseUser.channelId,
  //         name: baseUser.name,
  //         timeSec: 999,
  //         videoId: 'vid_123',
  //       },
  //     ];

  //     // drizzle チェーンのモック構造
  //     // db.update(users) -> { set(fn) } -> { where(fn) } -> { returning(fn) }
  //     const returningFn = jest.fn<Promise<UserRow[]>, []>().mockResolvedValue(returning);
  //     const where = jest.fn().mockReturnValue({ returning: returningFn });
  //     const set = jest.fn().mockReturnValue({ where });
  //     (mockedDb.update as jest.Mock).mockReturnValue({ set });

  //     const res = await userDb.updateTimeSec({ ...baseUser, timeSec: 999 }, 30);

  //     expect(set).toHaveBeenCalledWith({ timeSec: 999 });
  //     expect(where).toHaveBeenCalledTimes(1);
  //     expect(returningFn).toHaveBeenCalledTimes(1);
  //     expect(res).toEqual(returning);
  //   });
  // });

  // describe('hasUser', () => {
  //   it('limit(1) の結果を返す', async () => {
  //     // hasUser は select({id}).from(users).where(...).limit(1) の結果を返す
  //     const expected: Array<Pick<UserRow, 'id'>> = [{ id: 77 }];

  //     // drizzle チェーンのモック構造
  //     // db.select(...) -> { from(fn) } -> { where(fn) } -> { limit(fn) }
  //     const limit = jest.fn<Promise<Array<Pick<UserRow, 'id'>>>, [number]>().mockResolvedValue(expected);
  //     const where = jest.fn().mockReturnValue({ limit });
  //     const from = jest.fn().mockReturnValue({ where });
  //     (mockedDb.select as jest.Mock).mockReturnValue({ from });

  //     const res = await userDb.hasUser({ ...baseUser });

  //     expect(from).toHaveBeenCalledTimes(1);
  //     expect(where).toHaveBeenCalledTimes(1);
  //     expect(limit).toHaveBeenCalledWith(1);
  //     expect(res).toEqual(expected);
  //   });
  // });

  // describe('getTotalTimeSec', () => {
  //   it('同一channelIdのtimeSec合計を返す', async () => {
  //     // 同一 channelId に紐づく行の timeSec を合計する
  //     const rows = [{ timeSec: 10 }, { timeSec: 20 }, { timeSec: 5 }];

  //     // db.select(...).from(...).where(...) -> rows を返すようにモック
  //     const where = jest.fn<Promise<Array<{ timeSec: number }>>, [unknown]>().mockResolvedValue(rows);
  //     const from = jest.fn().mockReturnValue({ where });
  //     (mockedDb.select as jest.Mock).mockReturnValue({ from });

  //     const total = await userDb.getTotalTimeSec(baseUser.channelId);

  //     expect(mockedDb.select).toHaveBeenCalledTimes(1);
  //     expect(from).toHaveBeenCalledTimes(1);
  //     expect(where).toHaveBeenCalledTimes(1);
  //     expect(total).toBe(35);
  //   });
  // });
});
