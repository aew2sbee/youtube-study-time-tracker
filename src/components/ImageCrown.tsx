import Image from 'next/image';

export default function ImageCrown({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={50}
      height={50}
      className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-8 h-8"
    />
  );
}
