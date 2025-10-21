import ImageProfile from './ImageProfile';
import { User } from '@/types/users';
import { calcTime } from '@/lib/calcTime';
import { Timer, TimerOff, Monitor, BookOpen, Pen} from 'lucide-react';
import { parameter } from '@/config/system';


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
          <div className="flex items-center space-x-2 text-3xl">
            <div className="relative">
              <ImageProfile src={user.profileImageUrl} alt={user.name} />
            </div>
            <span className="text-black font-medium truncate max-w-[300px] ">{user.name}</span>
            {
              // 作業
              user.category === parameter.ALLOW_WORDS[0] ? (<Monitor className="text-black w-8 h-8" />)
              // 勉強
              : user.category === parameter.ALLOW_WORDS[1] ? (<Pen className="text-black w-8 h-8" />)
              // 読書
              : user.category === parameter.ALLOW_WORDS[2] ? (<BookOpen className="text-black w-8 h-8" />)
              : <div className="w-8 h-8" />
            }
          </div>

          <div className="flex items-end text-3xl">
          {
            user.isStudying
            ? <span className="text-black">{calcTime(user.timeSec)}</span>
            : <span className="text-gray-400">{calcTime(user.timeSec)}</span>
          }
          </div>
        </div>
      ))}
    </div>
  );
}
