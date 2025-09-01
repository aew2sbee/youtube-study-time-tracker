// logger を無音化
jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// DB をモック（テストごとに戻り値を差し替える）
jest.mock('@/db', () => {
  return {
    db: {
      update: jest.fn(),
      insert: jest.fn(),
      select: jest.fn(),
    },
  };
});

// schema は実物をそのまま使う（型取得のみ）
import { users } from '@/db/schema';
type UserRow = typeof users.$inferSelect;

type MockDb = {
  update: jest.Mock;
  insert: jest.Mock;
  select: jest.Mock;
};
let mockedDb: MockDb;
let userDb: typeof import('@/db/user');

describe('db/user', () => {
  const baseUser = {
    channelId: 'ch_1',
    name: 'Taro',
    timeSec: 120,
    profileImageUrl: 'http://example.com/p.png',
    updateTime: new Date('2024-01-01T00:00:00Z'),
    isStudying: false,
  } as const;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.VIDEO_ID = 'vid_123';
    userDb = await import('@/db/user');
    const dbModule = await import('@/db');
    mockedDb = dbModule.db as unknown as MockDb;
  });

  describe('saveUser', () => {
    it('既存ユーザーがいる場合は updateTimeSec を呼ぶ', async () => {
      const existing: Array<Pick<UserRow, 'id'>> = [{ id: 10 }];
      const updated: UserRow[] = [
        {
          id: 10,
          channelId: baseUser.channelId,
          name: baseUser.name,
          timeSec: baseUser.timeSec,
          videoId: 'vid_123',
        },
      ];

      const spyHas = jest.spyOn(userDb, 'hasUser').mockResolvedValue(existing);
      const spyUpdate = jest.spyOn(userDb, 'updateTimeSec').mockResolvedValue(updated);
      const spyInsert = jest
        .spyOn(userDb, 'insertUser')
        .mockResolvedValue([
          { id: 99, channelId: baseUser.channelId, name: baseUser.name, timeSec: baseUser.timeSec, videoId: 'vid_123' },
        ] as UserRow[]);

      const res = await userDb.saveUser({ ...baseUser });

      expect(spyHas).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith({ ...baseUser }, 10);
      expect(spyInsert).not.toHaveBeenCalled();
      expect(res).toEqual(updated);
    });

    it('既存ユーザーがいない場合は insertUser を呼ぶ', async () => {
      const inserted: UserRow[] = [
        {
          id: 11,
          channelId: baseUser.channelId,
          name: baseUser.name,
          timeSec: baseUser.timeSec,
          videoId: 'vid_123',
        },
      ];

      const spyHas = jest.spyOn(userDb, 'hasUser').mockResolvedValue([]);
      const spyUpdate = jest
        .spyOn(userDb, 'updateTimeSec')
        .mockResolvedValue([
          { id: 1, channelId: baseUser.channelId, name: baseUser.name, timeSec: baseUser.timeSec, videoId: 'vid_123' },
        ] as UserRow[]);
      const spyInsert = jest.spyOn(userDb, 'insertUser').mockResolvedValue(inserted);

      const res = await userDb.saveUser({ ...baseUser });

      expect(spyHas).toHaveBeenCalledTimes(1);
      expect(spyInsert).toHaveBeenCalledWith({ ...baseUser });
      expect(spyUpdate).not.toHaveBeenCalled();
      expect(res).toEqual(inserted);
    });
  });

  describe('insertUser', () => {
    it('db.insert(...).values(...).returning() の結果を返す', async () => {
      const returning: UserRow[] = [
        {
          id: 20,
          channelId: baseUser.channelId,
          name: baseUser.name,
          timeSec: baseUser.timeSec,
          videoId: 'vid_123',
        },
      ];

      const returningFn = jest.fn<Promise<UserRow[]>, []>().mockResolvedValue(returning);
      const values = jest.fn().mockReturnValue({ returning: returningFn });
      (mockedDb.insert as jest.Mock).mockReturnValue({ values });

      const res = await userDb.insertUser({ ...baseUser });

      expect(values).toHaveBeenCalledWith({
        channelId: baseUser.channelId,
        name: baseUser.name,
        timeSec: baseUser.timeSec,
        videoId: process.env.VIDEO_ID,
      });
      expect(returningFn).toHaveBeenCalledTimes(1);
      expect(res).toEqual(returning);
    });
  });

  describe('updateTimeSec', () => {
    it('db.update(...).set(...).where(...).returning() の結果を返す', async () => {
      const returning: UserRow[] = [
        {
          id: 30,
          channelId: baseUser.channelId,
          name: baseUser.name,
          timeSec: 999,
          videoId: 'vid_123',
        },
      ];

      const returningFn = jest.fn<Promise<UserRow[]>, []>().mockResolvedValue(returning);
      const where = jest.fn().mockReturnValue({ returning: returningFn });
      const set = jest.fn().mockReturnValue({ where });
      (mockedDb.update as jest.Mock).mockReturnValue({ set });

      const res = await userDb.updateTimeSec({ ...baseUser, timeSec: 999 }, 30);

      expect(set).toHaveBeenCalledWith({ timeSec: 999 });
      expect(where).toHaveBeenCalledTimes(1);
      expect(returningFn).toHaveBeenCalledTimes(1);
      expect(res).toEqual(returning);
    });
  });

  describe('hasUser', () => {
    it('limit(1) の結果を返す', async () => {
      const expected: Array<Pick<UserRow, 'id'>> = [{ id: 77 }];

      const limit = jest.fn<Promise<Array<Pick<UserRow, 'id'>>>, [number]>().mockResolvedValue(expected);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      (mockedDb.select as jest.Mock).mockReturnValue({ from });

      const res = await userDb.hasUser({ ...baseUser });

      expect(from).toHaveBeenCalledTimes(1);
      expect(where).toHaveBeenCalledTimes(1);
      expect(limit).toHaveBeenCalledWith(1);
      expect(res).toEqual(expected);
    });
  });

  describe('getTotalTimeSec', () => {
    it('同一channelIdのtimeSec合計を返す', async () => {
      const rows = [{ timeSec: 10 }, { timeSec: 20 }, { timeSec: 5 }];

      const where = jest.fn<Promise<Array<{ timeSec: number }>>, [unknown]>().mockResolvedValue(rows);
      const from = jest.fn().mockReturnValue({ where });
      (mockedDb.select as jest.Mock).mockReturnValue({ from });

      const total = await userDb.getTotalTimeSec('ch_1');

      expect(mockedDb.select).toHaveBeenCalledTimes(1);
      expect(from).toHaveBeenCalledTimes(1);
      expect(where).toHaveBeenCalledTimes(1);
      expect(total).toBe(35);
    });
  });
});
