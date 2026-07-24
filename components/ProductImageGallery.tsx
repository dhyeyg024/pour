"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  accent?: string;
}

export function ProductImageGallery({ images, alt, accent }: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="productGallery">
      <div className="productGalleryMain">
        <Image
          key={images[selected]}
          src={images[selected]}
          alt={`${alt} — view ${selected + 1} of ${images.length}`}
          fill
          sizes="(max-width: 760px) 82vw, 30vw"
          className="productGalleryMainImg"
          priority={selected === 0}
        />
      </div>
      <div className="productGalleryThumbs" role="tablist" aria-label={`${alt} product images`}>
        {images.map((src, index) => {
          const active = index === selected;
          return (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Show image ${index + 1}`}
              className={`productGalleryThumb ${active ? "productGalleryThumbActive" : ""}`}
              style={{ "--accent": accent } as React.CSSProperties}
              onClick={() => setSelected(index)}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="56px"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
