import { User } from '@/types/users';
import { logger } from '@/server/lib/logger';
import { EventEmitter } from 'events';

/**
 * サーバー側のユーザー状態管理（メモリ管理・揮発性）
 * - Map<channelId, User>でアクティブユーザーを管理
 * - サーバー再起動で状態はリセットされる
 * - EventEmitterでSSEにリアルタイム通知
 */

// ユーザー状態を保持するMap（メモリ管理）
const userStore = new Map<string, User>();

// イベントエミッター（SSE通知用）
const userStoreEmitter = new EventEmitter();

// メモリリーク防止のためリスナー数上限を設定
userStoreEmitter.setMaxListeners(100);


/**
 * ユーザー更新イベントを発行（SSE通知用）
 */
export const emitUsersUpdate = async (): Promise<void> => {
  const users = getAllUsers();
  userStoreEmitter.emit('usersUpdate', users);
};

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

/**
 * 現在のストアのサイズを取得
 * @returns ストア内のユーザー数
 */
export const getUserStoreSize = (): number => {
  return userStore.size;
};

/**
 * ユーザー更新イベントのリスナーを登録
 * @param listener - イベントハンドラー
 * @returns リスナー解除関数
 */
export const onUsersUpdate = (listener: (users: User[]) => void): (() => void) => {
  userStoreEmitter.on('usersUpdate', listener);

  // リスナー解除関数を返す
  return () => {
    userStoreEmitter.off('usersUpdate', listener);
  };
};
