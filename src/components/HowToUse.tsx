export default function HowToUse() {
  return (
    <div className="text-white text-3xl items-start justify-start pt-4">
      <p>誰でも気軽に参加できます 😊</p>
      <p>※見てるだけでも、挨拶だけでも大歓迎です!</p>
      <p className="pt-3">📌 参加方法</p>
      <ul className="space-y-2">
        <li>コメント欄に<strong>「start」</strong>と入力 → 計測開始</li>
        <li>コメント欄に<strong>「end」 </strong>と入力 → 計測終了</li>
        <li>何回でも参加OK。時間は自動で累積されます</li>
      </ul >
    </div>
  );
}
