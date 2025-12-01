import ImageProfile from './ImageProfile';
import { User } from '@/types/users';
import { calcTime } from '@/server/lib/calcTime';
import { Timer, TimerOff } from 'lucide-react';

export default function FocusMode({ user }: { user: User }) {
  return (
    <>
      <div key={user.displayName} className="bg-black/5 rounded-lg flex items-center justify-between p-3">
        <div className="flex items-center space-x-2 text-3xl">
          <div className="relative">
            <ImageProfile src={user.profileImageUrl} alt={user.displayName} />
          </div>
          <span className="text-black font-medium truncate max-w-[280px]">{user.displayName}</span>
        </div>

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
