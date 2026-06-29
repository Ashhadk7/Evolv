"use client";

import { useSyncExternalStore } from "react";
import { Icon, type IconProps } from "@iconify/react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ClientIcon({ width, height, style, ...props }: IconProps) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const iconWidth = width ?? 16;
  const iconHeight = height ?? width ?? 16;

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          width: iconWidth,
          height: iconHeight,
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  return <Icon width={width} height={height} style={style} {...props} />;
}
