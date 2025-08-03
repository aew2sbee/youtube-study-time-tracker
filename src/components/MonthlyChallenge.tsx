import { useState, useEffect } from 'react';
import { calcTime, calculateTargetValues } from '@/utils/calc';
import FlowerImage from './ImageFlower';
import AnimationStar from './AnimationStar';
import ProgressBar from './ProgressBar';
import { parameter } from '@/config/system';

// アニメーション設定
const ANIMATION_CONFIG = {
  duration: 3000,
  steps: 180,
};

export default function MonthlyChallenge({
  now,
  totalStudyTime,
}: {
  now: Date;
  totalStudyTime: number;
}) {
  const [animatedPercentage, setAnimatedPercentage] = useState<number>(0);
  const [animatedFlowerLevel, setAnimatedFlowerLevel] = useState<number>(1);

  useEffect(() => {
    const { targetPercentage, targetFlowerLevel } = calculateTargetValues(totalStudyTime);

    setAnimatedPercentage(0);
    setAnimatedFlowerLevel(1);

    const stepTime = ANIMATION_CONFIG.duration / ANIMATION_CONFIG.steps;
    const percentageStep = targetPercentage / ANIMATION_CONFIG.steps;
    const flowerLevelStep = (targetFlowerLevel - 1) / ANIMATION_CONFIG.steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;

      // 線形進行：ステップ数に比例して値を増加
      const currentPercentage = Math.min(Math.round(percentageStep * currentStep), targetPercentage);
      const currentFlowerLevel = Math.min(Math.round(1 + flowerLevelStep * currentStep), targetFlowerLevel);

      setAnimatedPercentage(currentPercentage);
      setAnimatedFlowerLevel(currentFlowerLevel);

      if (currentStep >= ANIMATION_CONFIG.steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [totalStudyTime]);
  const CURRENT_YEAR_MONTH = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="flex-1 flex flex-row pt-4">
      <div className="w-2/5 flex flex-col justify-center space-y-2 pr-8">
        <div className="text-white text-center">
          <div className="text-2xl mb-2">Current Progress</div>
          <div className="text-4xl font-bold">
            {parseInt(calcTime(totalStudyTime).slice(0, -3))} / {parseInt(calcTime(parameter.TARGET_STUDY_TIME).slice(0, -3))} h
          </div>
        </div>
        <div className="text-white text-center">
          <div className="text-2xl mb-2">Current Progress Percent</div>
          <div className="text-4xl font-bold">{animatedPercentage} %</div>
        </div>
      </div>
      <div className="w-3/5 flex flex-col pl-8 relative justify-center items-center">
        <div className="flex justify-center items-center relative mb-4">
          <FlowerImage
            key={animatedFlowerLevel}
            src={`/flower/${CURRENT_YEAR_MONTH}/${animatedFlowerLevel}.png`}
            alt="Progress flower"
          />
          {animatedFlowerLevel === 10 && <AnimationStar />}
        </div>
        <div className="w-full">
          <ProgressBar animatedPercentage={animatedPercentage} />
        </div>
      </div>
    </div>
  );
}
