import Image from 'next/image';

export default function ImageProfile({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} width={50} height={50} className="w-[50px] h-[50px] rounded-full" />;
}
