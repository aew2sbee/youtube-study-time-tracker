export default function ProgressBar({ animatedPercentage }: { animatedPercentage: number }) {
  return (
    <div className="absolute bottom-2 left-8 right-8 bg-gray-700 rounded-full h-6">
      <div
        className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-200 ease-out relative overflow-hidden"
        style={{width: `${Math.min(animatedPercentage, 100)}%`}}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
        <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
      </div>
    </div>
  );
}
