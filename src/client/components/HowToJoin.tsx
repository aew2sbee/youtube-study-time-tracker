import { Lightbulb, MessageCircleQuestion, Wrench } from 'lucide-react';

export default function HowToJoin() {
  return (
    <div className="text-black text-3xl space-y-3 items-start justify-start">
      {/* 時間計測モード */}
      <div className="flex items-center pt-3">
        <Wrench className="w-9 h-9 mr-2 text-gray-600" />
        <p className="text-3xl font-bold">時間計測モード</p>
      </div>
      <p className="pl-4">- 内容: 集中時間を計測</p>
      <p className="pl-4">- 開始: <span className="font-bold">&quot;start&quot;</span>のみを入力</p>
      <p className="pl-4">- 終了: <span className="font-bold">&quot;end&quot;</span>のみを入力</p>
      <div className="flex items-center">
        <Lightbulb className="w-9 h-9 text-orange-500" />
        <p className="underline">終了時に<span className="font-bold">記録通知&#40;7日/28日/累計&#41;</span></p>
      </div>

      {/* レベル上げモード */}
      <div className="flex items-center pt-3">
        <Wrench className="w-9 h-9 mr-2 text-gray-600" />
        <p className="text-3xl font-bold">レベル上げモード</p>
      </div>
      <p className="pl-4">- 内容: 集中時間に応じてレベル上昇</p>
      <p className="pl-4">- 開始: <span className="font-bold">&quot;lvup&quot;</span>のみを入力</p>
      <p className="pl-4">- 終了: <span className="font-bold">&quot;end&quot;</span>のみを入力</p>
      <div className="flex items-center">
        <Lightbulb className="w-9 h-9 text-orange-500" />
        <p className="underline"><span className="font-bold">勉強のモチベ・習慣化</span>に活用してね</p>
      </div>

      <p className="text-3xl pt-4 font-bold">よくある質問&#40;Q&amp;A&#41;</p>
      <div className="flex items-center pt-3">
        <MessageCircleQuestion className="w-8 h-8 mr-2 text-gray-500" />
        <p className="text-3xl font-bold">何回も参加OK？</p>
      </div>
      <p className="underline pl-4">A. 何回でもどうぞ</p>

      <div className="flex items-center pt-3">
        <MessageCircleQuestion className="w-8 h-8 mr-2 text-gray-500" />
        <p className="text-3xl font-bold">少しの時間でも大丈夫？</p>
      </div>
      <p className="underline pl-4">A. 短時間でも歓迎です!!</p>

      <div className="flex items-center pt-3">
        <MessageCircleQuestion className="w-8 h-8 mr-2 text-gray-500" />
        <p className="text-3xl font-bold">再開時、時間はリセット？</p>
      </div>
      <p className="underline pl-4">A. 時間は累積されます</p>
    </div>
  );
}
