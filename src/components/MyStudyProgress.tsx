import { STUDY_PROGRESS_ITEMS } from "../../database/parameter";

export default function MyStudyProgress() {
  return (
    <div className="flex-1 flex flex-col justify-start pt-4">
      <ul className="space-y-2">
        {STUDY_PROGRESS_ITEMS.map((item, index) => (
          <li key={index} className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-lg">
            <span className="text-white font-medium text-3xl">{item.key}</span>
            <span className="text-white font-bold text-3xl">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
