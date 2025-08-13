import Image from 'next/image';

export default function ExplanationCrown() {
  return (
    <div className="mt-4 p-3 bg-white/10 rounded-lg">
      <div className="flex justify-center items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Image src="/crown/gold.png" alt="Gold Crown" width={40} height={40} className="w-[40px] h-[40px]" />
          <span className="text-white text-2xl">60min +</span>
        </div>
        <div className="flex items-center space-x-2">
          <Image src="/crown/silver.png" alt="Silver Crown" width={40} height={40} className="w-[40px] h-[40px]" />
          <span className="text-white text-2xl">30min +</span>
        </div>
      </div>
    </div>
  );
}
