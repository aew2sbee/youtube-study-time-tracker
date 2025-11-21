import { User } from '@/types/users';
import { logger } from '@/server/lib/logger';

/**
 * サーバー側のユーザー状態管理（メモリ管理・揮発性）
 * - Map<channelId, User>でアクティブユーザーを管理
 * - サーバー再起動で状態はリセットされる
 */

// ユーザー状態を保持するMap（メモリ管理）
const userStore = new Map<string, User>();

/**
 * ユーザーを取得
 * @param channelId - チャンネルID
 * @returns ユーザー情報（存在しない場合はundefined）
 */
export const getUser = (channelId: string): User | undefined => userStore.get(channelId);;

/**
 * ユーザーを保存または更新
 * @param user - ユーザー情報
 */
export const setUser = (user: User): void => {
  userStore.set(user.channelId, user);
  logger.info(`UserStore: ${user.displayName}の状態を更新しました`);
};

/**
 * すべてのアクティブユーザーを取得
 * @returns アクティブユーザー一覧（isStudying: trueのユーザーのみ）
 */
export const getAllActiveUsers = (): User[] => {
  const allUsers = Array.from(userStore.values());
  const activeUsers = allUsers.filter((user) => user.isStudying);
  logger.info(`UserStore: ${activeUsers.length}人のアクティブユーザーを取得しました`);
  return activeUsers;
};

/**
 * すべてのユーザーを取得（isStudyingに関係なく）
 * @returns 全ユーザー一覧
 */
export const getAllUsers = (): User[] => {
  const allUsers = Array.from(userStore.values());
  logger.info(`UserStore: ${allUsers.length}人のユーザーを取得しました`);
  return allUsers;
};
