const studyProgressItems = [
  { key: 'Update Time', text: '2025/08/03' },
  { key: 'Current Study', text: '基本情報技術者試験 (FE)' },
  { key: 'Total Study Time', text: '39 / 150h' },
  { key: 'Exam Date', text: 'Not scheduled yet' },
];

export default function MyStudyProgress() {
  return (
    <div className="flex-1 flex flex-col justify-start pt-4">
      <ul className="space-y-2">
        {studyProgressItems.map((item, index) => (
          <li key={index} className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
            <span className="text-white font-medium text-3xl">{item.key}</span>
            <span className="text-white font-bold text-3xl">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
