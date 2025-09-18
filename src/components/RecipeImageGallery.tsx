import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ImageOff } from "lucide-react";

interface RecipeImageGalleryProps {
  images: string[];
}

export default function RecipeImageGallery({
  images,
}: RecipeImageGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const remainingCount = images.length - 3;

  const openModal = (index: number = 0) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  return (
    <>
      <div className="w-full">
        {images.length === 1 ? (
          <div
            className="relative cursor-pointer group"
            onClick={() => openModal(0)}
          >
            <ImageWithFallback
              src={images[0]}
              alt="Recipe image"
              className="w-full h-80 sm:h-96 object-cover rounded-xl shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-transparent transition-all duration-200 rounded-xl flex items-center justify-center">
              <ZoomIn
                className="text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                size={32}
              />
            </div>
          </div>
        ) : images.length === 2 ? (
          <div className="grid grid-cols-2 gap-3">
            {images.slice(0, 2).map((src, index) => (
              <div
                key={index}
                className="relative cursor-pointer group aspect-square"
                onClick={() => openModal(index)}
              >
                <ImageWithFallback
                  src={src}
                  alt={`Recipe image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <ZoomIn
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    size={24}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 h-80">
            <div
              className="col-span-2 relative cursor-pointer group aspect-square sm:aspect-[4/3]"
              onClick={() => openModal(0)}
            >
              <ImageWithFallback
                src={images[0]}
                alt="Recipe image 1"
                className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-transparent transition-all duration-200 rounded-xl flex items-center justify-center">
                <ZoomIn
                  className="text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  size={32}
                />
              </div>
            </div>

            <div className="col-span-2 grid grid-rows-2 gap-3">
              <div
                className="relative cursor-pointer group aspect-[2/1]"
                onClick={() => openModal(1)}
              >
                <ImageWithFallback
                  src={images[1]}
                  alt="Recipe image 2"
                  className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <ZoomIn
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    size={20}
                  />
                </div>
              </div>

              <div
                className="relative cursor-pointer group aspect-[2/1]"
                onClick={() => openModal(2)}
              >
                <ImageWithFallback
                  src={images[2]}
                  alt="Recipe image 3"
                  className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
                />
                {remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">
                        +{remainingCount}
                      </div>
                      <div className="text-sm">more</div>
                    </div>
                  </div>
                )}
                {remainingCount === 0 && (
                  <div className="absolute inset-0 bg-transparent transition-all duration-200 rounded-xl flex items-center justify-center">
                    <ZoomIn
                      className="text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      size={32}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-50 rounded-full"
            >
              <X size={24} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black bg-opacity-50 rounded-full"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black bg-opacity-50 rounded-full"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <img
              src={images[currentImageIndex]}
              alt={`Recipe image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={() => {
                console.error(
                  "Image failed to load:",
                  images[currentImageIndex]
                );
              }}
            />

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
                {images.map((src, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  return error ? (
    <div
      className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
    >
      <ImageOff size={48} />
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
