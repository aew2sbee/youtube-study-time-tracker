import Image from 'next/image';

export default function ImageProfile({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} width={40} height={40} className="w-10 h-10 rounded-full" />;
}
