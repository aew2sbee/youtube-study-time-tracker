export default function HowToJoin() {
  return (
    <div className="text-white text-3xl items-start justify-start pt-2">
      <p>誰でも気軽に参加できます 😊</p>
      <p className="pt-3">📌 参加方法</p>
      <ul className="space-y-2">
        <li>チャット欄に<strong>「start」</strong>のみを入力 → 計測開始</li>
        <li>チャット欄に<strong>「end」 </strong>のみを入力 → 計測終了</li>
        <li>何回でも参加OK。時間は自動で累積されます</li>
      </ul>
      <p>計測終了にモデレーターから<strong>累計時間</strong>を通知</p>
    </div>
  );
}
