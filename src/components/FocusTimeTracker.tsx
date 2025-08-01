import { system } from '@/config/parameter';
import { StudyTimeUser } from '@/types/youtube';
import { calcTime } from '@/utils/calc';
import ImageCrown from './ImageCrown';
import ImageProfile from './ImageProfile';

export default function FocusTimeTracker({ displayedUsers }: { displayedUsers: StudyTimeUser[] }) {
  



const totalUserPages = Math.ceil(user.length / parameter.USERS_PER_PAGE);


  return displayedUsers.length === 0 ? (
    <div className="text-white text-center text-2xl flex-1 flex items-start justify-center pt-16">
      <div className="space-y-2">
        <div>どなたでも集中時間の計測に参加できます</div>
        <div>
          コメント欄に<strong>「start」</strong>で開始、<strong>「end」</strong>で終了
        </div>
        <div>
          複数回の<strong>「start」/「end」</strong>で時間が累積されます
        </div>
      </div>
    </div>
  ) :
  
  
  
  (
    <div className="space-y-4 flex-1 overflow-hidden p-2">
      {displayedUsers.map((user) => (
        <div key={user.name} className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ImageProfile src={user.profileImageUrl} alt={user.name} />
              {user.studyTime >= system.CRON_TIME_GOLD ? (
                <ImageCrown src="/crown/mark_oukan_crown1_gold.png" alt="crown gold" />
              ) : user.studyTime >= system.CRON_TIME_SILVER ? (
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
