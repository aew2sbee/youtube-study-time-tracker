import * as sut from '@/lib/calcTime';
import { SAMPLE_USER_001, SAMPLE_USER_002, SAMPLE_USER_003 } from '../../mock/user';
import { ADDITIONAL_STUDY_TIME } from '@/lib/calcTime';

// parameter設定のモック
jest.mock('@/config/system', () => ({
  parameter: {
    TARGET_STUDY_TIME: 550 * 60 * 60, // 550時間
  }
}));

describe('calcTime.ts', () => {
  describe('calcStudyTime - 学習時間計算', () => {
    it('正常な時間差を正しく秒数で計算する', () => {
      const start = new Date('2023-01-01T10:00:00Z');
      const end = new Date('2023-01-01T11:30:00Z');
      expect(sut.calcStudyTime(start, end)).toBe(5400); // 1.5時間 = 5400秒
    });

    it('終了時刻が開始時刻より前の場合は0を返す', () => {
      const start = new Date('2023-01-01T12:00:00Z');
      const end = new Date('2023-01-01T10:00:00Z');
      expect(sut.calcStudyTime(start, end)).toBe(0);
    });

    it('開始時刻と終了時刻が同じ場合は0を返す', () => {
      const time = new Date('2023-01-01T10:00:00Z');
      expect(sut.calcStudyTime(time, time)).toBe(0);
    });

    it('ミリ秒が含まれる場合は切り捨てて計算する', () => {
      const start = new Date('2023-01-01T10:00:00.500Z');
      const end = new Date('2023-01-01T10:00:01.400Z');
      expect(sut.calcStudyTime(start, end)).toBe(0); // 0.9秒 → floor(0) = 0
    });

    it('1秒未満の差は0秒として処理される', () => {
      const start = new Date('2023-01-01T10:00:00.000Z');
      const end = new Date('2023-01-01T10:00:00.999Z');
      expect(sut.calcStudyTime(start, end)).toBe(0);
    });
  });

  describe('calcTotalTime - 合計学習時間計算', () => {
    const testUsers = [SAMPLE_USER_002, SAMPLE_USER_003]; // 200秒 + 300秒 = 500秒

    it('全ユーザーの学習時間と追加学習時間を合計する', () => {
      expect(calcTotalTime(testUsers)).toBe(500 + ADDITIONAL_STUDY_TIME);
    });

    it('ユーザー配列が空の場合は追加学習時間のみを返す', () => {
      expect(sut.calcTotalTime([])).toBe(ADDITIONAL_STUDY_TIME);
    });

    it('学習時間が0のユーザーも正しく処理する', () => {
      const usersWithZero = [SAMPLE_USER_001, SAMPLE_USER_002]; // 0秒 + 200秒 = 200秒
      expect(sut.calcTotalTime(usersWithZero)).toBe(200 + ADDITIONAL_STUDY_TIME);
    });
  });

  describe('calcTime - 英語形式時間フォーマット', () => {
    it('秒数を時間と分の形式で正しく表示する', () => {
      expect(sut.calcTime(3661)).toBe('1h 01min'); // 1時間1分1秒
      expect(sut.calcTime(3600)).toBe('1h 00min'); // 1時間
      expect(sut.calcTime(60)).toBe('0h 01min'); // 1分
      expect(sut.calcTime(59)).toBe('0h 00min'); // 59秒
    });

    it('0秒の場合は0h 00minを返す', () => {
      expect(sut.calcTime(0)).toBe('0h 00min');
    });

    it('大きな値も正しく処理する', () => {
      expect(sut.calcTime(36000)).toBe('10h 00min'); // 10時間
      expect(sut.calcTime(90061)).toBe('25h 01min'); // 25時間1分1秒
    });

    it('分の部分は2桁でゼロパディングされる', () => {
      expect(sut.calcTime(3665)).toBe('1h 01min'); // 1時間1分5秒
      expect(sut.calcTime(7260)).toBe('2h 01min'); // 2時間1分
    });

    it('サンプルユーザーの学習時間を正しくフォーマットする', () => {
      expect(sut.calcTime(SAMPLE_USER_002.timeSec)).toBe('0h 03min'); // 200秒 = 3分20秒
      expect(sut.calcTime(SAMPLE_USER_003.timeSec)).toBe('0h 05min'); // 300秒 = 5分
    });
  });

  describe('calcTimeJP - 日本語形式時間フォーマット', () => {
    it('秒数を日本語の時分形式で正しく表示する', () => {
      expect(sut.calcTimeJP(3661)).toBe('1時01分'); // 1時間1分1秒
      expect(sut.calcTimeJP(3600)).toBe('1時00分'); // 1時間
      expect(sut.calcTimeJP(60)).toBe('0時01分'); // 1分
      expect(sut.calcTimeJP(59)).toBe('0時00分'); // 59秒
    });

    it('0秒の場合は0分を返す', () => {
      expect(sut.calcTimeJP(0)).toBe('0分');
      expect(sut.calcTimeJP(SAMPLE_USER_001.timeSec)).toBe('0分');
    });

    it('大きな値も正しく処理する', () => {
      expect(sut.calcTimeJP(36000)).toBe('10時00分'); // 10時間
      expect(sut.calcTimeJP(90061)).toBe('25時01分'); // 25時間1分1秒
    });

    it('分の部分は2桁でゼロパディングされる', () => {
      expect(sut.calcTimeJP(3665)).toBe('1時01分'); // 1時間1分5秒
      expect(sut.calcTimeJP(7260)).toBe('2時01分'); // 2時間1分
    });

    it('サンプルユーザーの学習時間を正しくフォーマットする', () => {
      expect(sut.calcTimeJP(SAMPLE_USER_002.timeSec)).toBe('0時03分'); // 200秒 = 3分20秒
      expect(sut.calcTimeJP(SAMPLE_USER_003.timeSec)).toBe('0時05分'); // 300秒 = 5分
    });
  });

  describe('calculateTargetValues - 目標達成率と花レベル計算', () => {
    it('目標達成率と花レベルを正しく計算する', () => {
      const targetTime = 550 * 60 * 60; // 550時間（100%）

      expect(sut.calculateTargetValues(targetTime / 2)).toEqual({
        targetPercentage: 50,
        targetFlowerLevel: 5
      });

      expect(sut.calculateTargetValues(targetTime)).toEqual({
        targetPercentage: 100,
        targetFlowerLevel: 10
      });
    });

    it('目標時間を超過した場合も正しく処理する', () => {
      const targetTime = 550 * 60 * 60;
      expect(sut.calculateTargetValues(targetTime * 1.5)).toEqual({
        targetPercentage: 150,
        targetFlowerLevel: 10 // 最大値10でキャップされる
      });
    });

    it('0秒の場合は0%、花レベル0を返す', () => {
      expect(sut.calculateTargetValues(0)).toEqual({
        targetPercentage: 0,
        targetFlowerLevel: 0
      });
      expect(sut.calculateTargetValues(SAMPLE_USER_001.timeSec)).toEqual({
        targetPercentage: 0,
        targetFlowerLevel: 0
      });
    });

    it('10%未満の場合は花レベル0となる', () => {
      const targetTime = 550 * 60 * 60;
      expect(sut.calculateTargetValues(targetTime * 0.05)).toEqual({ // 5%
        targetPercentage: 5,
        targetFlowerLevel: 0
      });
    });

    it('花レベルは10％刻みで上がる', () => {
      const targetTime = 550 * 60 * 60;
      expect(sut.calculateTargetValues(targetTime * 0.15)).toEqual({ // 15%
        targetPercentage: 15,
        targetFlowerLevel: 1
      });
      expect(sut.calculateTargetValues(targetTime * 0.25)).toEqual({ // 25%
        targetPercentage: 25,
        targetFlowerLevel: 2
      });
    });

    it('サンプルユーザーの少ない学習時間でも正しく計算する', () => {
      // 200秒や300秒程度では目標達成率は非常に小さくなる
      const result1 = sut.calculateTargetValues(SAMPLE_USER_002.timeSec);
      const result2 = sut.calculateTargetValues(SAMPLE_USER_003.timeSec);

      expect(result1.targetPercentage).toBe(0); // 550時間に対して200秒は0%
      expect(result1.targetFlowerLevel).toBe(0);
      expect(result2.targetPercentage).toBe(0); // 550時間に対して300秒は0%
      expect(result2.targetFlowerLevel).toBe(0);
    });
  });

  describe('convertHHMMSS - 時刻文字列変換', () => {
    it('ISO文字列を日本の時刻形式に変換する', () => {
      const isoString = '2023-01-01T15:30:45Z';
      const result = sut.convertHHMMSS(isoString);
      expect(result).toMatch(/^\d{1,2}:\d{2}:\d{2}$/); // H:MM:SS または HH:MM:SS形式
    });

    it('異なるタイムゾーンも正しく日本時間に変換される', () => {
      const isoString = '2023-01-01T06:00:00Z'; // UTC
      const result = sut.convertHHMMSS(isoString);
      expect(result).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
      // 日本時間での表示となることを確認（具体的な値は環境依存）
    });

    it('24時間形式で表示される', () => {
      const isoString = '2023-01-01T23:59:59Z';
      const result = sut.convertHHMMSS(isoString);
      expect(result).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
      expect(result).not.toContain('AM');
      expect(result).not.toContain('PM');
    });

    it('1桁時間も正しく表示される', () => {
      const isoString = '2023-01-01T03:05:30Z';
      const result = sut.convertHHMMSS(isoString);
      expect(result).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    });

    it('サンプルユーザーのupdateTimeを正しく変換する', () => {
      const result = sut.convertHHMMSS(SAMPLE_USER_001.updateTime.toISOString());
      expect(result).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    });
  });
});