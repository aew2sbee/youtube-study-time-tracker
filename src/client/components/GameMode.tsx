import ImageProfile from './ImageProfile';
import { User } from '@/types/users';
import { motion } from 'framer-motion';
import { calcMin, calcTime } from '@/server/lib/calcTime';
import { Timer, TimerOff } from 'lucide-react';

export default function GameMode({ user }: { user: User }) {
  return (
    <>
      <div key={user.displayName} className="bg-black/5 rounded-lg flex items-center justify-between p-3">
        <div className="flex items-center space-x-3 text-3xl">
          <div className="relative">
            <ImageProfile src={user.profileImageUrl} alt={user.displayName} />
          </div>
          {/* レベル表示 */}
          <span className="font-medium truncate w-[85px]">
            <span className="text-2xl">Lv.</span>
            <span className="text-3xl">{user.level}</span>
          </span>
        </div>
        {/* EXPバー */}
        <div className="flex flex-col space-y-0.5 pr-2">
          {/* 時間情報表示 */}
            <div className="font-medium flex justify-between">
              <span className="text-lg">to the next lv</span>
                <span>
                  <span className="text-xl font-semibold">{calcMin((user.timeToNextLevel))}</span>
                  <span className="text-base">m</span>
                </span>
            </div>
          {/* プログレスバー */}
          <div className="relative w-44 h-4 bg-gray-300 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
              initial={{ width: 0 }}
              animate={{ width: `${user.progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        {/* タイマーアイコンと時間 */}
        <div className="flex items-center text-3xl">
          {user.isStudying ? (
            <Timer className="text-green-600 w-10 h-10 mr-3 animate-pulse" />
          ) : (
            <TimerOff className="text-gray-400 w-10 h-10 mr-3" />
          )}
          <span>{calcTime(user.timeSec)}</span>
        </div>
      </div>
    </>
  );
}
