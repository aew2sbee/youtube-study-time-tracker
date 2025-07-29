'use client';

// import { StudyTimeDisplay } from '@/components/StudyTimeDisplay';
// import { useStudyTime } from '@/hooks/useStudyTime';
import FadeMotion from '@/components/FadeMotion';
import MyStudyProgress from '@/components/MyStudyProgress';
import WeeklyStudyBarChart from '@/components/WeeklyStudyBarChart';

export default function Home() {
  // const { users, nextUpdateTime, formatTime, formatUpdateTime, getTotalStudyTime, targetStudyTime, showProgressBar, personalProgress } = useStudyTime();

  return (
    // <FadeMotion />
    <MyStudyProgress />
    // <StudyTimeDisplay
    //   users={users}
    //   formatTime={formatTime}
    //   nextUpdateTime={nextUpdateTime}
    //   formatUpdateTime={formatUpdateTime}
    //   getTotalStudyTime={getTotalStudyTime}
    //   targetStudyTime={targetStudyTime}
    //   showProgressBar={showProgressBar}
    //   personalProgress={personalProgress}
    // />
  );
}
