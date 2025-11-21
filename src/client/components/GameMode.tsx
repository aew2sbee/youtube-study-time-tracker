import ImageProfile from './ImageProfile';
import { User } from '@/types/users';
import { motion } from 'framer-motion';
import { calcMin } from '@/server/lib/calcTime';

export default function Experience({ user }: { user: User[] }) {
  if (!user || user.length === 0) {
    return (
      <div className="text-center text-3xl flex-1 flex items-start justify-center pt-16">
        <div className="space-y-2">
          <div>集中時間の計測に参加しているユーザーがいません</div>
          <div>まずは「start」で計測を開始しましょう</div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 flex-1 overflow-hidden p-2">
      {user.map((user) => (
        <div key={user.displayName} className="bg-black/5 rounded-lg flex items-center justify-between p-2 h-[74px]">
          <div className="flex items-center space-x-2 text-3xl">
            <div className="relative">
              <ImageProfile src={user.profileImageUrl} alt={user.displayName} />
            </div>
            {/* レベル表示 */}
            <span className="font-medium truncate max-w-[300px]">
              <span className="text-2xl">Lv.</span>
              <span className="text-3xl">{user.level}</span>
            </span>
          </div>
          <div className="flex flex-col space-y-0.5">
            {/* 時間情報表示 */}
            {!user.isMaxLevel && (
              <div className="font-medium text-center">
                <span className="text-sm">次のレベルまで: </span>
                <span className="text-xl">
                  {calcMin(user.timeToNextLevel)} / {calcMin(user.nextLevelRequiredTime)}
                </span>
              </div>
            )}
            {user.isMaxLevel && (
              <div className="text-xl font-medium text-center">MAX LEVEL</div>
            )}
            {/* EXPとプログレスバー */}
            <div className="flex items-center space-x-3">
              {/* EXP表示 */}
              <div className="text-xl font-semibold">EXP</div>
              {/* プログレスバー */}
              <div className="relative w-40 h-4 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="absolute h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${user.progress * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
