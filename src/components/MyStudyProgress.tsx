const UPDATE_DATE = '2025/07/30';
const CURRENT_STUDY = '基本情報技術者試験 (FE)';
const TOTAL_TIME = 38; // 個人の累積勉強時間（秒）- 22時間
const GOAL_TIME = 150; // 目標勉強時間（秒）- 150時間
const EXAM_DATE = 'Not scheduled yet';
const TEST_SCORE = '科目A: 67%, 科目B: 61%';

export default function MyStudyProgress() {
  return (
    <div className="flex-1 flex flex-col justify-start pt-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
          <span className="text-white font-medium text-2xl">Current Study</span>
          <span className="text-white font-bold text-2xl">{CURRENT_STUDY}</span>
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
          <span className="text-white font-medium text-2xl">Total Study Time</span>
          <span className="text-white font-bold text-2xl">{TOTAL_TIME} / {GOAL_TIME}h</span>
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
          <span className="text-white font-medium text-2xl">Exam Date</span>
          <span className="text-white font-bold text-2xl">{EXAM_DATE}</span>
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
          <span className="text-white font-medium text-2xl">Test Score</span>
          <span className="text-white font-bold text-2xl">{TEST_SCORE}</span>
        </div>
      </div>
    </div>
  );
}
