import React from 'react';
import { StudyTimeUser } from '@/types/youtube';
import Image from 'next/image';
import { formatTime } from '@/utils';

export const CRON_TIME_SILVER = 1800; // 30分（秒）
export const CRON_TIME_GOLD = 3600; // 1時間（秒）

export default function FocusTimeTracker(user: StudyTimeUser) {
  return (
    <div>
      <div className="space-y-4 flex-1 overflow-hidden p-2">
        <div key={user.name} className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={user.profileImageUrl}
                alt={user.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
              {user.studyTime >= CRON_TIME_GOLD ? (
                <Image
                  src="/crown/mark_oukan_crown1_gold.png"
                  alt="crown"
                  width={50}
                  height={50}
                  className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-8 h-8"
                />
              ) : user.studyTime >= CRON_TIME_SILVER ? (
                <Image
                  src="/crown/mark_oukan_crown2_silver.png"
                  alt="crown"
                  width={50}
                  height={50}
                  className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-8 h-8"
                />
              ) : null}
            </div>
            <span className="text-white font-medium truncate max-w-[200px] text-3xl">
              {user.name}
            </span>
          </div>

          <div className="text-white font-bold flex items-center text-4xl">
            {user.isStudying ? (
              <span className="text-green-400 w-32 text-center text-2xl mr-4 animate-pulse">
                Focusing
              </span>
            ) : user.studyTime > 0 ? (
              <span className="text-blue-400 w-32 text-center text-2xl mr-4">
                Finished
              </span>
            ) : null}
            <span>{formatTime(user.studyTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
