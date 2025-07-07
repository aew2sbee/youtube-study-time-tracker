'use client';

import { StudyTimeDisplay } from '@/components/StudyTimeDisplay';
import { useStudyTime } from '@/hooks/useStudyTime';

export default function Home() {
  const { users, nextUpdateTime, formatTime, formatUpdateTime, getTotalStudyTime, targetStudyTime, showProgressBar, personalProgress } = useStudyTime();

  return (
    <StudyTimeDisplay
      users={users}
      formatTime={formatTime}
      nextUpdateTime={nextUpdateTime}
      formatUpdateTime={formatUpdateTime}
      getTotalStudyTime={getTotalStudyTime}
      targetStudyTime={targetStudyTime}
      showProgressBar={showProgressBar}
      personalProgress={personalProgress}
    />
  );
}
