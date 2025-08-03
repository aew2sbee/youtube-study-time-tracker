import { calcTime } from '@/utils/calc';
import FlowerImage from './ImageFlower';
import AnimationStar from './AnimationStar';
import ProgressBar from './ProgressBar';
import { parameter } from '@/config/system';

export default function MonthlyChallenge({
  now,
  animatedFlowerLevel,
  animatedPercentage,
  totalStudyTime,
}: {
  now: Date;
  animatedFlowerLevel: number;
  animatedPercentage: number;
  totalStudyTime: number;
}) {
  const CURRENT_YEAR_MONTH = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return (
    <div className="flex-1 flex flex-row pt-4">
      <div className="w-2/5 flex flex-col justify-center space-y-2 pr-8">
        <div className="text-white text-center">
          <div className="text-lg mb-2">Current Progress</div>
          <div className="text-4xl font-bold">
            {parseInt(calcTime(totalStudyTime).slice(0, -3))} / {parseInt(calcTime(parameter.TARGET_STUDY_TIME).slice(0, -3))} h
          </div>
        </div>
        <div className="text-white text-center">
          <div className="text-lg mb-2">Current Progress Percent</div>
          <div className="text-5xl font-bold">{animatedPercentage} %</div>
        </div>
      </div>
      <div className="w-3/5 flex flex-col pl-8 relative">
        <div className="flex justify-center items-center relative">
          <FlowerImage
            key={animatedFlowerLevel}
            src={`/flower/${CURRENT_YEAR_MONTH}/${animatedFlowerLevel}.png`}
            alt="Progress flower"
          />
          {animatedFlowerLevel === 10 && <AnimationStar />}
        </div>
        <ProgressBar animatedPercentage={animatedPercentage} />
      </div>
    </div>
  );
}
