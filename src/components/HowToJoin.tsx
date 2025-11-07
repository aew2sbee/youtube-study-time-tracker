import {BookOpen, Pen, GraduationCap, Award, Briefcase, ClipboardList, School, Boxes, Palette} from 'lucide-react';

export default function HowToJoin() {
  return (
    <div className="text-black text-3xl space-y-3 items-start justify-start">
      <p className="text-4xl pt-2 font-bold">1. 計測開始</p>
      <p className="pl-4">チャット欄に<strong>「start」</strong>のみを入力</p>
      <p className="pl-4">※Botくんが受付をしてくれます。</p>
      <p className="text-4xl pt-2 font-bold">2. 計測終了</p>
      <p className="pl-4">チャット欄に<strong>「end」</strong>のみを入力</p>
      <p className="pl-4">※Botくんが結果を教えてくれます。</p>

      <p className="text-4xl pt-4 font-bold">3. オプション機能</p>
      <p className="pl-4">以下の<strong>「アイコン名」</strong>を追加で入力</p>
      <p className="pl-4 text-2xl">一緒に頑張る仲間が見つかるかも!!</p>
      <ul className="pl-4 grid grid-cols-3 gap-4">
        <li className="flex items-center space-x-2">
          <Briefcase className="w-9 h-9" />
          <span>:「仕事」</span>
        </li>
        <li className="flex items-center space-x-2">
          <ClipboardList className="w-9 h-9" />
          <span>:「作業」</span>
        </li>
        <li className="flex items-center space-x-2">
          <BookOpen className="w-9 h-9" />
          <span>:「読書」</span>
        </li>
        <li className="flex items-center space-x-2">
          <Pen className="w-9 h-9" />
          <span>:「勉強」</span>
        </li>
        <li className="flex items-center space-x-2">
          <GraduationCap className="w-9 h-9" />
          <span>:「受験」</span>
        </li>
        <li className="flex items-center space-x-2">
          <Award className="w-9 h-9" />
          <span>:「資格」</span>
        </li>
        <li className="flex items-center space-x-2">
          <School className="w-9 h-9" />
          <span>:「宿題」</span>
        </li>
        <li className="flex items-center space-x-2">
          <Palette className="w-9 h-9" />
          <span>:「趣味」</span>
        </li>
        <li className="flex items-center space-x-2">
          <Boxes className="w-9 h-9" />
          <span>:「雑多」</span>
        </li>
      </ul>

      <p className="text-3xl pt-4 font-bold">補足情報</p>
      <ul className="pl-8 text-2xl">
        <li>1. 配信中なら、何回でも参加OK!!</li>
        <li>2. 同じ配信なら、時間は累積します。</li>
        <li>3. 計測終了がないと、記録しません。</li>
      </ul>
    </div>
  );
}
