export default function HowToJoin() {
  return (
    <div className="text-black text-3xl space-y-3 items-start justify-start pt-2">
      <p className="pt-2">手順</p>

      <p className="text-4xl pt-4 font-bold">1. 計測開始</p>
      <p className="pl-4">チャット欄に<strong>「start」</strong>のみを入力</p>
      <p className="pl-4">※Botくんが受付をしてくれます。</p>
      <p className="text-4xl pt-4 font-bold">2. 計測終了</p>
      <p className="pl-4">チャット欄に<strong>「end」</strong>のみを入力</p>
      <p className="pl-4">※Botくんが結果を教えてくれます。</p>

      <p className="text-4xl pt-4 font-bold">補足情報</p>
      <ul className="pl-8">
        <li>1. 配信中なら、何回でも参加OK!!</li>
        <li>2. 同じ配信なら、時間は累積します。</li>
        <li>3. 計測終了がないと、記録しません。</li>
        <li>4. 24時間配信は、Bot機能はOFFです。</li>
      </ul>
    </div>
  );
}
