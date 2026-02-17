/**
 * Utility functions for color manipulation
 */

/**
 * Converts a hex color to RGBA with specified alpha/opacity
 * @param hex - Hex color string (e.g., '#FF6B35')
 * @param alpha - Alpha value between 0 and 1
 * @returns RGBA string
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
