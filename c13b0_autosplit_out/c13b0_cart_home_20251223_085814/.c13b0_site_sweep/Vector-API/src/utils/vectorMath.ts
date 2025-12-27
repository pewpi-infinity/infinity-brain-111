export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export const calculateMagnitude = (dimensions: number[]): number => {
  return Math.sqrt(dimensions.reduce((sum, val) => sum + val * val, 0));
};

export const normalizeVector = (dimensions: number[]): number[] => {
  const magnitude = calculateMagnitude(dimensions);
  if (magnitude === 0) return dimensions.map(() => 0);
  return dimensions.map(val => val / magnitude);
};
