import Image from 'next/image';

export default function FlowerImage({ key, src, alt }: { key: number; src: string; alt: string }) {
  return (
    <Image
      key={key}
      src={src}
      alt={alt}
      width={600}
      height={600}
      className="w-64 h-64 object-contain transition-all duration-300 ease-in-out"
    />
  );
}
