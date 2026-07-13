"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <>
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`${alt} - Slide ${index + 1}`}
          fill
          sizes="(max-width: 900px) 100vw, 52vw"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
          }}
          loading={index === 0 ? "lazy" : undefined}
        />
      ))}
    </>
  );
}