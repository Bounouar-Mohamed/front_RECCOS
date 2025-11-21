import { css } from "@/styled-system/css";

export const liquidRingStyles = {
  container: css({
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "150px",
    zIndex: 50,
    pointerEvents: "none",
    overflow: "visible",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    willChange: "transform",
    transform: "translateZ(0)",
    backfaceVisibility: "hidden",
    paddingX: "20px !important",
    paddingBottom: 4,
    "@media (max-width: 768px)": {
      height: "120px",
      paddingX: 3,
      paddingBottom: 3,
    },
  }),

  logoContainer: css({
    width: "150px",
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "@media (max-width: 768px)": {
      width: "120px",
      height: "120px",
    },
  }),

  image: css({
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    visibility: "visible",
    opacity: 1,
    willChange: "transform",
    transform: "translateZ(0)",
    backfaceVisibility: "hidden",
    imageRendering: "auto",
  }),

  button: css({
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingX: "25px !important",
    paddingY: "15px !important",
    fontFamily: "var(--font-bebas-neue), sans-serif",
    fontWeight: 400,
    fontSize: "1.5rem",
    borderRadius: "999px",
    transition: "background 0.2s ease, transform 0.2s ease",
    cursor: "pointer",
    pointerEvents: "auto",
    textDecoration: "none",
    color: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(10px) saturate(160%)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 28px 90px rgba(15, 23, 42, 0.22)",
    // Border gradient comme la navbar
    _before: {
      content: "''",
      position: "absolute",
      inset: 0,
      borderRadius: "999px",
      padding: "1px",
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0.9) 100%)",
      WebkitMask:
        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      pointerEvents: "none",
      zIndex: -1,
    },
    _hover: {
      background: "rgba(255,255,255,0.1)",
      transform: "scale(1.05)",
    },
    _active: {
      transform: "scale(0.95)",
    },
  }),
};