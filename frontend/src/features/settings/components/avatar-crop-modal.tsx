"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { MID } from "@/features/settings/lib/settings-theme";

const OUTPUT_SIZE = 256;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the image."));
    img.src = src;
  });
}

// Crops the selected pixel area to a fixed small square JPEG — keeps the stored
// image tiny regardless of the original file.
async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process the image."))),
      "image/jpeg",
      0.85
    );
  });
}

export function AvatarCropModal({
  imageSrc,
  saving,
  onCancel,
  onSave,
}: {
  imageSrc: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const handleSave = async () => {
    if (!area) return;
    onSave(await getCroppedBlob(imageSrc, area));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md bg-white p-5"
        style={{ borderRadius: 12, border: "1px solid #d4e4db" }}
      >
        <h3 className="text-[14px] font-extrabold" style={{ color: "#1a2e26" }}>
          Adjust your photo
        </h3>
        <p className="mt-1 text-[11px]" style={{ color: "#7a9e8e" }}>
          Drag to reposition and use the slider to zoom.
        </p>

        <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl bg-[#0f1c18]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="mt-4 w-full"
          style={{ accentColor: MID }}
          aria-label="Zoom"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border px-4 py-2 text-[12px] font-bold disabled:opacity-50"
            style={{ borderColor: "#dde5e0", color: "#0f1c18" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !area}
            className="bp-gradient-btn rounded-lg px-4 py-2 text-[12px] font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
