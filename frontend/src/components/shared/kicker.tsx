import type { ReactNode } from "react";
import { MONO } from "./card-style";

export const Kicker = ({ children }: { children: ReactNode }) => (
  <div
    className="text-bp-label"
    style={{
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      marginBottom: 7,
      fontFamily: MONO,
    }}
  >
    {children}
  </div>
);
