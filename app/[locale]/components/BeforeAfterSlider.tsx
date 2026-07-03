"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  /** The reference/original photo, or the finished colored piece — shown UNDER the divider */
  beforeImage: string;
  /** The outline/preview version, or the numbered PBN page — shown clipped, revealed as the slider moves */
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  /**
   * Aspect ratio of the display box, as width/height (e.g. 4/5 for a portrait photo).
   * Since your reference and outline images may not share the exact same ratio,
   * object-contain is used inside this box so neither image is ever cropped —
   * any mismatch just shows as empty space (letterboxing) around the shorter image.
   */
  aspectRatio?: number;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Reference",
  afterLabel = "Preview",
  aspectRatio = 3 / 5,
  className = "",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none overflow-hidden rounded-xl shadow-lg touch-none bg-neutral-100 ${className}`}
      style={{ aspectRatio: String(aspectRatio) }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Bottom image — always fully visible, object-contain so nothing is cropped */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-contain pointer-events-none"
          draggable={false}
        />
        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
          {beforeLabel}
        </span>
      </div>

      {/* Top image — clipped by slider position, revealed from the right so the
          bottom (before) image shows through on the LEFT and this shows on the RIGHT.
          object-contain so nothing is cropped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-contain pointer-events-none"
          draggable={false}
        />
        <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
          {afterLabel}
        </span>
      </div>

      {/* Divider line + handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md cursor-ew-resize">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L1 8L5 13M11 3L15 8L11 13" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
