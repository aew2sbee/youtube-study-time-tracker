const UPDATE_DATE = '2025/07/24';
const CURRENT_STUDY = '基本情報技術者試験 (FE)';
const TOTAL_TIME = 36;
const EXMA_DATE = 'Not scheduled yet';
const TEST_SCORE = '科目A: 63%, 科目B: 95%';

export default function MyStudyProgress() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-white">My Study Progress</h1>
        <div className="text-white text-2xl">
          {`Updated Date: ${UPDATE_DATE}`}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-start pt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
            <span className="text-white font-medium text-2xl">Current Study</span>
            <span className="text-white font-bold text-2xl">{CURRENT_STUDY}</span>
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
            <span className="text-white font-medium text-2xl">Total Study Time</span>
            <span className="text-white font-bold text-2xl">{TOTAL_TIME} / 150h</span>
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
            <span className="text-white font-medium text-2xl">Exam Date</span>
            <span className="text-white font-bold text-2xl">{EXMA_DATE}</span>
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
            <span className="text-white font-medium text-2xl">Test Score</span>
            <span className="text-white font-bold text-2xl">{TEST_SCORE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
