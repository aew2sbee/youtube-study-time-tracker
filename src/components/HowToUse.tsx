export default function HowToUse() {
  return (
    <div className="text-white text-center text-2xl flex-1 flex items-start justify-center pt-16">
      <div className="space-y-2">
        <div>どなたでも時間の計測に参加できます</div>
        <div>
          コメント欄に<strong>「start」</strong>で開始、<strong>「end」</strong>で終了
        </div>
        <div>
          複数回の<strong>「start」/「end」</strong>で時間が累積されます
        </div>
      </div>
    </div>
  );
}
