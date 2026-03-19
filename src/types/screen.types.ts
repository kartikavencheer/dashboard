// export type ScreenType = "SMART_TV" | "LED_SMALL" | "LED_MEDIUM" | "LED_LARGE";

// export const ScreenConfig = {
//   SMART_TV: { rows: 6, cols: 6 },
//   LED_SMALL: { rows: 8, cols: 6 },
//   LED_MEDIUM: { rows: 10, cols: 8 },
//   LED_LARGE: { rows: 14, cols: 10 },
// };
export const ScreenConfig = {
  SMART_TV: { rows: 1, cols: 1 },
  LED_SMALL: { rows: 2, cols: 2 },
  LED_MEDIUM: { rows: 3, cols: 3 },
  LED_LARGE: { rows: 4, cols: 4 },
} as const;

// ✅ magic line
export type ScreenType = keyof typeof ScreenConfig;
