import Image from 'next/image';

export default function ExplanationCrown() {
  return (
    <div className="mt-4 p-3 bg-white/10 rounded-lg">
      <div className="flex justify-center items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Image src="/crown/crown_gold.png" alt="Gold Crown" width={24} height={24} className="w-6 h-6" />
          <span className="text-white text-xl">60min+</span>
        </div>
        <div className="flex items-center space-x-2">
          <Image src="/crown/crown_silver.png" alt="Silver Crown" width={24} height={24} className="w-6 h-6" />
          <span className="text-white text-xl">30min+</span>
        </div>
      </div>
    </div>
  );
}
