"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type VehicleGalleryProps = {
  title: string;
  images: string[];
  fallback: ReactNode;
};

export function VehicleGallery({ title, images, fallback }: VehicleGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  if (images.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <div className="vehicle-gallery">
      <div className="gallery-main">
        <img src={selectedImage} alt={title} />
      </div>

      {images.length > 1 ? (
        <div className="gallery-thumbs" aria-label="Fotos del vehiculo">
          {images.map((image, index) => (
            <button
              className={selectedImage === image ? "gallery-thumb active" : "gallery-thumb"}
              key={image}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`Ver foto ${index + 1}`}
            >
              <img src={image} alt={`${title} foto ${index + 1}`} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
