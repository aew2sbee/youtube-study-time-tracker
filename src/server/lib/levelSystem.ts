/**
 * レベルシステム - 経験値計算
 *
 * 仕様:
 * - 最大レベル: 200
 * - 最大レベル到達時間: 1000時間（3,600,000秒）
 * - 低レベル時はレベルが上がりやすい
 * - 高レベル時はレベルが上がりにくい（指数曲線）
 */

/** レベルシステムの定数 */
const LEVEL_CONFIG = {
  /** 最大レベル */
  MAX_LEVEL: 200,
  /** 最大レベル到達時間（秒） */
  MAX_TIME_SECONDS: 1000 * 60 * 60, // 1000時間
  /** 経験値曲線の指数（高いほど後半が厳しい） */
  EXPONENT: 2.04,
} as const;

/**
 * 各レベルに到達するために必要な累積時間を計算する基礎係数
 * MAX_LEVEL^EXPONENT で MAX_TIME_SECONDS になるように調整
 */
const BASE_COEFFICIENT =
  LEVEL_CONFIG.MAX_TIME_SECONDS / Math.pow(LEVEL_CONFIG.MAX_LEVEL, LEVEL_CONFIG.EXPONENT);

/**
 * 学習時間（秒）からレベルを計算
 *
 * @param timeInSeconds - 累積学習時間（秒）
 * @returns レベル（1〜200）
 *
 * @example
 * ```typescript
 * calculateLevel(0)           // => 1
 * calculateLevel(3600)        // => 低レベル（例: 15）
 * calculateLevel(1800000)     // => 中レベル（例: 100）
 * calculateLevel(3600000)     // => 200（最大）
 * calculateLevel(5000000)     // => 200（上限超過）
 * ```
 */
export const calculateLevel = (timeInSeconds: number): number => {
  // 0秒の場合はレベル1
  if (timeInSeconds <= 0) {
    return 1;
  }

  // 最大時間を超えている場合は最大レベル
  if (timeInSeconds >= LEVEL_CONFIG.MAX_TIME_SECONDS) {
    return LEVEL_CONFIG.MAX_LEVEL;
  }

  // 逆関数でレベルを計算: level = (time / BASE_COEFFICIENT)^(1/EXPONENT)
  const level = Math.pow(timeInSeconds / BASE_COEFFICIENT, 1 / LEVEL_CONFIG.EXPONENT);

  // 小数点を切り捨てて整数レベルにし、最小値1、最大値200に制限
  return Math.max(1, Math.min(LEVEL_CONFIG.MAX_LEVEL, Math.floor(level)));
};

/**
 * レベルから必要な累積学習時間（秒）を計算
 *
 * @param level - レベル（1〜200）
 * @returns そのレベルに到達するために必要な累積時間（秒）
 *
 * @example
 * ```typescript
 * getRequiredTimeForLevel(1)    // => 0
 * getRequiredTimeForLevel(50)   // => 低い時間
 * getRequiredTimeForLevel(100)  // => 中程度の時間
 * getRequiredTimeForLevel(200)  // => 3,600,000（1000時間）
 * ```
 */
export const getRequiredTimeForLevel = (level: number): number => {
  // レベル1は0秒
  if (level <= 1) {
    return 0;
  }

  // レベル範囲チェック
  const clampedLevel = Math.max(1, Math.min(LEVEL_CONFIG.MAX_LEVEL, level));

  // 累積時間 = BASE_COEFFICIENT * level^EXPONENT
  return Math.floor(BASE_COEFFICIENT * Math.pow(clampedLevel, LEVEL_CONFIG.EXPONENT));
};

/**
 * 次のレベルまでに必要な残り時間（秒）を計算
 *
 * @param timeInSeconds - 現在の累積学習時間（秒）
 * @returns 次のレベルまでの残り時間（秒）、最大レベルの場合は0
 *
 * @example
 * ```typescript
 * getTimeToNextLevel(3600)    // => 次のレベルまでの残り秒数
 * getTimeToNextLevel(3600000) // => 0（最大レベル到達）
 * ```
 */
export const getTimeToNextLevel = (timeInSeconds: number): number => {
  const currentLevel = calculateLevel(timeInSeconds);

  // 最大レベルの場合は0を返す
  if (currentLevel >= LEVEL_CONFIG.MAX_LEVEL) {
    return 0;
  }

  const nextLevel = currentLevel + 1;
  const requiredTimeForNextLevel = getRequiredTimeForLevel(nextLevel);

  return Math.max(0, requiredTimeForNextLevel - timeInSeconds);
};

/**
 * 現在のレベルの進捗率を計算（0.0〜1.0）
 *
 * @param timeInSeconds - 現在の累積学習時間（秒）
 * @returns 現在のレベル内での進捗率（0.0〜1.0）
 *
 * @example
 * ```typescript
 * getLevelProgress(3600)    // => 0.5（レベル内で50%進行）
 * getLevelProgress(3600000) // => 1.0（最大レベル到達）
 * ```
 */
export const getLevelProgress = (timeInSeconds: number): number => {
  const currentLevel = calculateLevel(timeInSeconds);

  // 最大レベルの場合は100%
  if (currentLevel >= LEVEL_CONFIG.MAX_LEVEL) {
    return 1.0;
  }

  const currentLevelTime = getRequiredTimeForLevel(currentLevel);
  const nextLevelTime = getRequiredTimeForLevel(currentLevel + 1);
  const timeInCurrentLevel = timeInSeconds - currentLevelTime;
  const timeNeededForLevel = nextLevelTime - currentLevelTime;

  return Math.max(0, Math.min(1, timeInCurrentLevel / timeNeededForLevel));
};

/**
 * レベル情報を一括取得
 *
 * @param timeInSeconds - 累積学習時間（秒）
 * @returns レベル情報オブジェクト
 *
 * @example
 * ```typescript
 * const info = getLevelInfo(3600);
 * console.log(info);
 * // {
 * //   level: 15,
 * //   progress: 0.42,
 * //   isMaxLevel: false,
 * //   timeToNextLevel: 1200,
 * //   nextLevelRequiredTime: 4800
 * // }
 * ```
 */
export const getLevelInfo = (timeInSeconds: number) => {
  const level = calculateLevel(timeInSeconds);
  const progress = getLevelProgress(timeInSeconds);
  const isMaxLevel = level >= LEVEL_CONFIG.MAX_LEVEL;
  const timeToNextLevel = getTimeToNextLevel(timeInSeconds);
  const nextLevelRequiredTime = isMaxLevel ? 0 : getRequiredTimeForLevel(level + 1);

  return {
    /** 現在のレベル */
    level,
    /** レベル内進捗率（0.0〜1.0） */
    progress,
    /** 最大レベルかどうか */
    isMaxLevel,
    /** 次のレベルまでの残り時間（秒） */
    timeToNextLevel,
    /** 次のレベルに到達するために必要な累積時間（秒） */
    nextLevelRequiredTime,
  };
};

/**
 * 4〜6のランダムな整数を生成する
 *
 * @returns 4, 5, 6 のいずれかの整数
 *
 * @example
 * ```typescript
 * const wisdom = getRandomWisdom(); // => 4, 5, または 6
 * ```
 */
export const getRandomWisdom = (): number => {
  return Math.floor(Math.random() * 3) + 4;
};
