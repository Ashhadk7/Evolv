"use client";

import { Star } from "@phosphor-icons/react";

export function clampRating(rating: number) {
  return Math.max(0, Math.min(5, Math.round(rating)));
}

export function RatingStars({
  rating,
  size = 14,
  interactive = false,
  onChange,
  className = "",
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}) {
  const safeRating = clampRating(rating);
  const stars = [1, 2, 3, 4, 5];

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${safeRating} out of 5 stars`}
    >
      {stars.map((star) => {
        const filled = star <= safeRating;
        const icon = (
          <Star
            size={size}
            weight={filled ? "fill" : "regular"}
            style={{ color: filled ? "#C4973A" : "#c7d2cc" }}
          />
        );

        if (!interactive) {
          return (
            <span key={star} className="leading-none">
              {icon}
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-[#f5f7f5]"
            aria-label={`Set rating to ${star} out of 5`}
          >
            {icon}
          </button>
        );
      })}
    </span>
  );
}
