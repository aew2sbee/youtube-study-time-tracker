export default function HowToUse() {
  return (
    <div className="text-white text-3xl items-start justify-start pt-4">
      <p>誰でも気軽に参加できます 😊</p>
      <p>※見てるだけでも、あいさつだけでも大歓迎です！</p>
      <p className="pt-3">📌 参加方法</p>
      <div className="space-y-2">
        <li>コメント欄に<strong>「start」</strong>と入力 → 計測<strong>開始</strong></li>
        <li>コメント欄に<strong>「end」 </strong>と入力 → 計測<strong>終了</strong></li>
        <li>何回でも参加OK。時間は自動で累積されます</li>
      </div>
    </div>
  );
}
