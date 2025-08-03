export default function AnimationStar() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* キラキラエフェクト - 花の画像内に収まるよう配置 */}
      <div className="absolute top-36 left-18 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-1300"></div>
      <div className="absolute top-32 left-14 w-3 h-3 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-500"></div>
      <div className="absolute top-16 left-10 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
      <div className="absolute top-7 left-10 w-3 h-3 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-900"></div>
      <div className="absolute top-3 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-300"></div>
      <div className="absolute top-28 left-8 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-1100"></div>
      <div className="absolute top-32 left-56 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-700"></div>
      <div className="absolute top-44 left-56 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-1500"></div>

      {/* 右側エリア */}
      <div className="absolute top-4 left-48 w-3 h-3 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-1600"></div>
      <div className="absolute top-44 left-10 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-70 animation-delay-800"></div>
      <div className="absolute top-10 left-56 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-75 animation-delay-200"></div>
      <div className="absolute top-12 left-48 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75 animation-delay-1200"></div>
      <div className="absolute top-40 left-48 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-80 animation-delay-600"></div>
      <div className="absolute top-20 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-1400"></div>
      <div className="absolute top-20 left-48 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-1800"></div>
      <div className="absolute top-40 left-12 w-3 h-3 bg-yellow-500 rounded-full animate-bounce opacity-85 animation-delay-1000"></div>

      {/* 下側エリア */}
      <div className="absolute top-7 left-28 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-70 animation-delay-750"></div>
      <div className="absolute top-48 left-32 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-350"></div>
      <div className="absolute top-48 left-20 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-100"></div>
      <div className="absolute top-12 left-14 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-75 animation-delay-550"></div>
      <div className="absolute top-48 left-56 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-80 animation-delay-650"></div>
      <div className="absolute top-24 left-48 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-250"></div>
      <div className="absolute top-12 left-40 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-450"></div>
      <div className="absolute top-44 left-48 w-2 h-2 bg-yellow-500 rounded-full animate-bounce opacity-85 animation-delay-850"></div>

      {/* 中央エリア */}
      <div className="absolute top-44 left-14 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-70 animation-delay-1550"></div>
      <div className="absolute top-5 left-32 w-2 h-2 bg-yellow-200 rounded-full animate-bounce opacity-70 animation-delay-1150"></div>
      <div className="absolute top-32 left-56 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75 animation-delay-950"></div>
      <div className="absolute top-28 left-12 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-75 animation-delay-1350"></div>
      <div className="absolute top-36 left-64 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-80 animation-delay-1050"></div>
      <div className="absolute top-32 left-56 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80 animation-delay-1450"></div>
      <div className="absolute top-6 left-32 w-3 h-3 bg-yellow-500 rounded-full animate-ping opacity-85 animation-delay-1250"></div>
      <div className="absolute top-36 left-56 w-2 h-2 bg-yellow-500 rounded-full animate-pulse opacity-85 animation-delay-1650"></div>
</div>
  );
}
