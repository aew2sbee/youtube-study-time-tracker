export default function HowToJoin() {
  return (
    <div className="text-black text-3xl space-y-3 items-start justify-start">
      <p className="text-4xl pt-2 font-bold">1. 時間計測</p>
      <p className="pl-4">チャット欄に<strong>「start/end」</strong>で計測</p>
      <p className="text-4xl pt-4 font-bold">2. レベル上げ</p>
      <p className="pl-4">チャット欄に<strong>「levelup」</strong>で参加</p>
      <p className="pl-4"><strong>HP</strong>は<strong>がんばるタイマー</strong>です</p>
      <p className="pl-4 text-2xl"><strong>「levelup」</strong>の後に<strong>頑張りたい時間&#40;分単位&#41;</strong>を入力</p>
      <p className="pl-4 text-2xl pb-4"><strong>「levelup 60m」</strong>で60分のタイマーになります</p>
      <p className="pl-4 text-2xl">※1: 終了したい場合<strong>「end」</strong>で終了</p>
      <p className="pl-4 text-2xl">※2: HPのデフォルトは<strong>120分</strong>です。</p>
      <p className="pl-4 text-2xl">※3: <strong>levelup</strong>の前に<strong>「start」</strong>は不要</p>
      <p className="pl-4 text-2xl">※4: <strong>HP</strong>を回復するのは、一度<strong>「end」</strong>で休憩</p>
      <p className="text-3xl pt-4 font-bold">補足情報</p>
      <ul className="pl-8 text-2xl">
        <li>1. 配信中なら、何回でも参加OK!!</li>
        <li>2. 同じ配信なら、時間は累積します。</li>
        <li>3. 計測終了がないと、記録しません。</li>
      </ul>
    </div>
  );
}
