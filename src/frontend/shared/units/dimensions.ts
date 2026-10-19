export type DimensionUnit = "cm" | "m";

export const CM_PER_M = 100;

export const toCm = (value: number, unit: DimensionUnit): number => {
  return unit === "m" ? value * CM_PER_M : value;
};

export const fromCm = (cm: number, unit: DimensionUnit): number => {
  return unit === "m" ? cm / CM_PER_M : cm;
};

export const formatDimension = (cm: number, unit: DimensionUnit = "cm"): string => {
  return `${fromCm(cm, unit)} ${unit}`;
};
