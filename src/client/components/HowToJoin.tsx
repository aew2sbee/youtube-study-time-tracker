import { Lightbulb, Wrench } from 'lucide-react';

export default function HowToJoin() {
  return (
    <div className="text-black text-3xl space-y-2 items-start justify-start">
      {/* 時間計測モード */}
      <div className="flex items-center pt-3">
        <Wrench className="w-9 h-9 mr-2 text-gray-600" />
        <p className="text-3xl font-bold">時間計測モード(Timer Mode)</p>
      </div>
      <p className="pl-4">開始: チャット欄に<span className="font-bold">&quot;start&quot;</span>を入力</p>
      <p className="pl-4">終了: チャット欄に<span className="font-bold">&quot;end&quot;</span>を入力</p>
      <div className="flex items-center">
        <Lightbulb className="w-9 h-9 text-orange-500" />
        <p className="">終了時に<span className="font-bold">記録通知&#40;7日/28日/累計&#41;</span></p>
      </div>

      <p className="pl-4 pt-6">Start: Type <span className="font-bold">&quot;start&quot;</span>in the chat</p>
      <p className="pl-4">End: Type <span className="font-bold">&quot;end&quot;</span>in the chat</p>
      <div className="flex items-center">
        <Lightbulb className="w-9 h-9 text-orange-500" />
        <p className="font-bold">End stats (7d / 28d / total)</p>
      </div>


      {/* レベル上げモード */}
      <div className="flex items-center pt-12">
        <Wrench className="w-9 h-9 mr-2 text-gray-600" />
        <p className="text-3xl font-bold">レベル上げモード(EXP Mode)</p>
      </div>
      <p className="pl-4">集中時間に応じてレベル上昇</p>
      <p className="pl-4">開始: チャット欄に<span className="font-bold">&quot;lvup&quot;</span>を入力</p>
      <p className="pl-4">終了: チャット欄に<span className="font-bold">&quot;end&quot;</span>を入力</p>
      <div className="flex items-center">
        <Lightbulb className="w-9 h-9 text-orange-500" />
        <p className=""><span className="font-bold">勉強のモチベ・習慣化</span>に活用してね</p>
      </div>

      <p className="pl-4 pt-6">Earn EXP by focusing</p>
      <p className="pl-4">Start: Type <span className="font-bold">&quot;lvup&quot;</span>in the chat</p>
      <p className="pl-4">End: Type <span className="font-bold">&quot;end&quot;</span>in the chat</p>
      <div className="flex items-center">
        <Lightbulb className="w-9 h-9 text-orange-500" />
        <p className="font-bold">For motivation & study habits!</p>
      </div>
    </div>
  );
}
