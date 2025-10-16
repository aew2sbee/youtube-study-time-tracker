import { parameter } from '@/config/system';
import ImageCrown from './ImageCrown';
import ImageProfile from './ImageProfile';
import { User } from '@/types/users';
import { calcTime } from '@/lib/calcTime';
import { Timer, TimerOff } from 'lucide-react';

export default function FocusTimeTracker({ user }: { user: User[] }) {
  if (!user || user.length === 0) {
    return (
      <div className="text-white text-center text-3xl flex-1 flex items-start justify-center pt-16">
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
        <div key={user.name} className="bg-black/5 rounded-lg flex items-center justify-between p-3">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ImageProfile src={user.profileImageUrl} alt={user.name} />
              {user.timeSec >= parameter.CRON_TIME_GOLD ? (
                <ImageCrown src="/crown/gold.png" alt="crown gold" />
              ) : user.timeSec >= parameter.CRON_TIME_SILVER ? (
                <ImageCrown src="/crown/silver.png" alt="crown silver" />
              ) : null}
            </div>
            <span className="text-black font-medium truncate max-w-[280px] text-3xl">{user.name}</span>
          </div>

          <div className="text-black flex items-center text-4xl">
            {user.isStudying ? (
              <Timer className="text-green-600 w-10 h-10 mr-3 animate-pulse" />
            ) : user.timeSec > 0 ? (
              <TimerOff className="text-gray-400 w-10 h-10 mr-3" />
            ) : null}
            <span className="text-3xl">{calcTime(user.timeSec)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
