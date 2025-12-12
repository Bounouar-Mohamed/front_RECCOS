import { css } from "@/styled-system/css";

export const vanishFormStyles = {
  form: css({
    position: "relative",
    mx: "auto",
    w: "100%",
    fontSize: { base: "1.375rem", md: "1.625rem", lg: "1.875rem" }, // Légèrement agrandi
    letterSpacing: "-0.05em",
    color: "white", // texte blanc sur fond noir
    overflow: "hidden",
  }),

  label: css({
    display: "flex",
    alignItems: "center",
    pr: 2,
    position: "relative",
    zIndex: 30,
    w: "100%",
    h: "100%",
    minH: { base: "3.5rem", lg: "5rem" },
    borderBottom: "1px solid",
    borderBottomColor: "rgba(255, 255, 255, 0.1)", // bordure claire sur fond noir
  }),

  input: css({
    position: "relative",
    zIndex: 50,
    h: "100%",
    w: "100%",
    border: "none",
    bg: "transparent",
    pr: 4,
    py: { base: 2, lg: 3 },
    color: "white",
    fontSize: "inherit",
    letterSpacing: "inherit",
    outline: "none",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.3)",
    },
    "&:focus": {
      outline: "none",
      ring: 0,
    },
  }),

  inputAnimating: css({
    color: "transparent", // cache le texte pendant l'anim
  }),

  submitButton: css({
    borderRadius: 6,
    display: "flex",
    h: "100%",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    pr: 4,
    color: "white",
    bg: "transparent",
    border: "none",
    fontSize: "inherit",
  }),

  enterHint: css({
    pt: 2,
    fontSize: { base: "0.6875rem", md: "0.8125rem", lg: "0.9375rem" }, // Légèrement agrandi
    letterSpacing: "tight",
    opacity: 0.5,
  }),

  inputDisabled: css({
    opacity: 0.6,
    cursor: "not-allowed",
  }),

  loadingWrapper: css({
    display: "flex",
    alignItems: "center",
    gap: 3,
    pr: 2,
  }),

  loadingSpinner: css({
    display: "inline-block",
    w: { base: "10px", md: "12px", lg: "14px" }, // Plus petit pour correspondre au texte
    h: { base: "10px", md: "12px", lg: "14px" },
    border: "1.5px solid rgba(255, 255, 255, 0.3)",
    borderTop: "1.5px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    verticalAlign: "middle",
    ml: 1,
  }),

  loadingText: css({
    fontSize: { base: "0.6875rem", md: "0.8125rem", lg: "0.9375rem" }, // Légèrement agrandi
    letterSpacing: "tight",
    opacity: 0.7,
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
  }),

};