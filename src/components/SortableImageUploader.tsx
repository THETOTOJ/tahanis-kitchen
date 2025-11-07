"use client";
import { useRef, Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";

interface SortableImageUploaderProps {
  images: File[];
  setImages: Dispatch<SetStateAction<File[]>>;
  previews: string[];
  setPreviews: Dispatch<SetStateAction<string[]>>;
  onRemove?: (index: number) => void | Promise<void>;
}
const placeholder = "/images/placeholder.png";

export default function SortableImageUploader({
  images,
  setImages,
  previews,
  setPreviews,
  onRemove,
}: SortableImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // use the images prop to avoid unused-variable warning
  const imageCount = images.length;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemove(index: number) {
    if (onRemove) {
      onRemove(index);
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  }

  return (
    <div className="w-full bg-gray-100 rounded-lg p-2 overflow-x-auto">
      <div className="flex gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative h-48 w-36 flex-shrink-0">
            {/* allow <img> for object URLs (blob URLs) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src || placeholder}
              alt="recipe image"
              className="h-full w-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Upload button */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative h-48 w-36 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-50"
          aria-label={`Upload images (${imageCount} added)`}
        >
          <span className="text-2xl">+</span>

          {imageCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-0.5 rounded-full">
              {imageCount}
            </span>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}