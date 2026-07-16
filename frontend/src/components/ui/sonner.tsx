"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          // sidebar green at low opacity for success; soft red / amber for the rest
          success:
            "!bg-[rgba(66,132,117,0.12)] !border-[rgba(66,132,117,0.35)] !text-[#1a2e26] [&_[data-icon]]:!text-[#2e7d5c]",
          error:
            "!bg-[rgba(192,57,43,0.10)] !border-[rgba(192,57,43,0.32)] !text-[#8a271b] [&_[data-icon]]:!text-[#c0392b]",
          warning:
            "!bg-[rgba(196,151,58,0.13)] !border-[rgba(196,151,58,0.35)] !text-[#6f5312] [&_[data-icon]]:!text-[#b07d1f]",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
