import { parameter } from '@/config/system';
import { StudyTimeUser } from '@/types/youtube';
import { calcTime } from '@/utils/calc';
import ImageCrown from './ImageCrown';
import ImageProfile from './ImageProfile';

export default function FocusTimeTracker({ displayedUsers }: { displayedUsers: StudyTimeUser[] }) {
  if (!displayedUsers || displayedUsers.length === 0) {
    return (
      <div className="text-white text-center text-2xl flex-1 flex items-start justify-center pt-16">
        <div className="space-y-2">
          <div>集中時間の計測に参加しているユーザーがいません</div>
          <div>まずは「start」で計測を開始しましょう</div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 flex-1 overflow-hidden p-2">
      {displayedUsers.map((user) => (
        <div key={user.name} className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ImageProfile src={user.profileImageUrl} alt={user.name} />
              {user.studyTime >= parameter.CRON_TIME_GOLD ? (
                <ImageCrown src="/crown/mark_oukan_crown1_gold.png" alt="crown gold" />
              ) : user.studyTime >= parameter.CRON_TIME_SILVER ? (
                <ImageCrown src="/crown/mark_oukan_crown2_silver.png" alt="crown silver" />
              ) : null}
            </div>
            <span className="text-white font-medium truncate max-w-[200px] text-3xl">{user.name}</span>
          </div>

          <div className="text-white font-bold flex items-center text-4xl">
            {user.isStudying ? (
              <span className="text-green-400 w-32 text-center text-2xl mr-4 animate-pulse">Focusing</span>
            ) : user.studyTime > 0 ? (
              <span className="text-blue-400 w-32 text-center text-2xl mr-4">Finished</span>
            ) : null}
            <span>{calcTime(user.studyTime)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
