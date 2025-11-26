export default function HowToJoin() {
  return (
    <div className="text-black text-3xl space-y-3 items-start justify-start">
      <p className="text-4xl pt-2 font-bold">1. みんなで&quot;時間計測&quot;</p>
      <p className="pl-4">チャット欄に<strong>「start/end」</strong>で計測</p>
      <p className="text-4xl pt-4 font-bold">2. みんなで&quot;レベル上げ&quot;</p>
      <p className="pl-4">チャット欄に<strong>「levelup」</strong>で参加</p>
      <p className="pl-4"><strong>HP</strong>はタイマーとして活用可能</p>
      <p className="pl-4">※1: 終了したい場合<strong>「end」</strong>で終了</p>
      <p className="pl-4">※2: HPのでデフォルトは<strong>120分</strong>です。</p>
      <p className="pl-4">※3: <strong>&quot;levelup 60m&quot;</strong>でHPを60分に設定</p>
      <p className="text-3xl pt-4 font-bold">補足情報</p>
      <ul className="pl-8 text-2xl">
        <li>1. 配信中なら、何回でも参加OK!!</li>
        <li>2. 同じ配信なら、時間は累積します。</li>
        <li>3. 計測終了がないと、記録しません。</li>
      </ul>
    </div>
  );
}
