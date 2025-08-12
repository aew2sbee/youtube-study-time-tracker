import { useState, useEffect, useMemo, useRef } from 'react';
import FlowerImage from './ImageFlower';
import AnimationStar from './AnimationStar';
import ProgressBar from './ProgressBar';
import { parameter } from '@/config/system';
import { calcTime, calculateTargetValues } from '@/lib/calcTime';

// アニメーション設定
const ANIMATION_CONFIG = {
  duration: 3000,
  steps: 180,
};

export default function MonthlyChallenge({ now, totalStudyTime }: { now: Date; totalStudyTime: number }) {
  const [animatedPercentage, setAnimatedPercentage] = useState<number>(0);
  const [animatedFlowerLevel, setAnimatedFlowerLevel] = useState<number>(1);
  const lastTotalStudyTimeRef = useRef<number | null>(null);

  const CURRENT_YEAR_MONTH = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

  const targetValues = useMemo(() => {
    return calculateTargetValues(totalStudyTime);
  }, [totalStudyTime]);

  useEffect(() => {
    if (lastTotalStudyTimeRef.current === totalStudyTime) return;

    const { targetPercentage, targetFlowerLevel } = targetValues;

    setAnimatedPercentage(0);
    setAnimatedFlowerLevel(1);

    const stepTime = ANIMATION_CONFIG.duration / ANIMATION_CONFIG.steps;
    const percentageStep = targetPercentage / ANIMATION_CONFIG.steps;
    const flowerLevelStep = (targetFlowerLevel - 1) / ANIMATION_CONFIG.steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;

      const currentPercentage = Math.min(Math.round(percentageStep * currentStep), targetPercentage);
      const currentFlowerLevel = Math.min(Math.round(1 + flowerLevelStep * currentStep), targetFlowerLevel);

      setAnimatedPercentage(currentPercentage);
      setAnimatedFlowerLevel(currentFlowerLevel);

      if (currentStep >= ANIMATION_CONFIG.steps) {
        clearInterval(interval);
      }
    }, stepTime);

    lastTotalStudyTimeRef.current = totalStudyTime;

    return () => clearInterval(interval);
  }, [totalStudyTime, targetValues]);

  return (
    <div className="flex-1 flex flex-row pt-4">
      <div className="w-2/5 flex flex-col justify-center space-y-2 pr-8">
        <div className="text-white text-center">
          <div className="text-3xl mb-2">Current Progress</div>
          <div className="text-4xl font-bold">
            {parseInt(calcTime(totalStudyTime).slice(0, -3))} /{' '}
            {parseInt(calcTime(parameter.TARGET_STUDY_TIME).slice(0, -3))} h
          </div>
        </div>
        <div className="text-white text-center">
          <div className="text-3xl mb-2">Current Progress Percent</div>
          <div className="text-5xl font-bold">{animatedPercentage} %</div>
        </div>
      </div>
      <div className="w-3/5 flex flex-col relative justify-center items-center">
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
