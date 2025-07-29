import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TARGET_STUDY_TIME } from '@/constants/config';
import { formatTime, getTotalStudyTime } from '@/utils';

const now = new Date();
const CURRENT_YEAR_MONTH = `${now.getFullYear()}${String(
  now.getMonth() + 1
).padStart(2, '0')}`;

export default function TotalStudyTime() {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [flowerTransitionKey, setFlowerTransitionKey] = useState(0);
  const [animatedFlowerLevel, setAnimatedFlowerLevel] = useState(1);
  return (
    <div>
      <div className="flex-1 flex flex-row pt-4">
        <div className="w-2/5 flex flex-col justify-center space-y-2 pr-8">
          <div className="text-white text-center">
            <div className="text-lg mb-2">Current Progress</div>
            <div className="text-4xl font-bold">
              {parseInt(formatTime(getTotalStudyTime()).slice(0, -3))} /{' '}
              {parseInt(formatTime(TARGET_STUDY_TIME).slice(0, -3))} h
            </div>
          </div>
          <div className="text-white text-center">
            <div className="text-lg mb-2">Current Progress Percent</div>
            <div className="text-5xl font-bold">{animatedPercentage} %</div>
          </div>
        </div>
        <div className="w-3/5 flex flex-col pl-8 relative">
          <div className="flex justify-center items-center relative">
            <Image
              key={flowerTransitionKey}
              src={`/flower/${CURRENT_YEAR_MONTH}/${animatedFlowerLevel}.png`}
              alt="Progress flower"
              width={600}
              height={600}
              className="w-64 h-64 object-contain transition-all duration-300 ease-in-out"
            />
            {animatedFlowerLevel === 10 && (
              <div className="absolute inset-0 pointer-events-none">
                {/* キラキラエフェクト - 花の画像内に収まるよう配置 */}
                <div className="absolute top-36 left-28 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-1300"></div>
                <div className="absolute top-32 left-24 w-3 h-3 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-500"></div>
                <div className="absolute top-16 left-20 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-7 left-40 w-3 h-3 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-900"></div>
                <div className="absolute top-3 left-32 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-300"></div>
                <div className="absolute top-28 left-64 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-1100"></div>
                <div className="absolute top-40 left-36 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-700"></div>
                <div className="absolute top-44 left-60 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-1500"></div>

                {/* 右側エリア */}
                <div className="absolute top-4 left-60 w-3 h-3 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-1600"></div>
                <div className="absolute top-44 left-10 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-70 animation-delay-800"></div>
                <div className="absolute top-10 left-72 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-75 animation-delay-200"></div>
                <div className="absolute top-12 left-60 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75 animation-delay-1200"></div>
                <div className="absolute top-40 left-80 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-80 animation-delay-600"></div>
                <div className="absolute top-20 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-1400"></div>
                <div className="absolute top-16 left-32 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-1800"></div>
                <div className="absolute top-80 left-12 w-3 h-3 bg-yellow-500 rounded-full animate-bounce opacity-85 animation-delay-1000"></div>

                {/* 下側エリア */}
                <div className="absolute top-56 left-28 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-70 animation-delay-750"></div>
                <div className="absolute top-48 left-32 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-350"></div>
                <div className="absolute top-48 left-20 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-100"></div>
                <div className="absolute top-12 left-14 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-75 animation-delay-550"></div>
                <div className="absolute top-52 left-64 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-80 animation-delay-650"></div>
                <div className="absolute top-24 left-72 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-250"></div>
                <div className="absolute top-14 left-40 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-450"></div>
                <div className="absolute top-56 left-48 w-2 h-2 bg-yellow-500 rounded-full animate-bounce opacity-85 animation-delay-850"></div>

                {/* 中央エリア */}
                <div className="absolute top-44 left-14 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-1550"></div>
                <div className="absolute top-40 left-32 w-2 h-2 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-1150"></div>
                <div className="absolute top-32 left-28 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75 animation-delay-950"></div>
                <div className="absolute top-28 left-12 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-1350"></div>
                <div className="absolute top-36 left-64 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-1050"></div>
                <div className="absolute top-32 left-80 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-1450"></div>
                <div className="absolute top-44 left-72 w-3 h-3 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-1250"></div>
                <div className="absolute top-44 left-80 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-1650"></div>
              </div>
            )}
          </div>
          <div className="absolute bottom-2 left-8 right-8 bg-gray-700 rounded-full h-6">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-200 ease-out relative overflow-hidden"
              style={{
                width: `${Math.min(animatedPercentage, 100)}%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
              <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
