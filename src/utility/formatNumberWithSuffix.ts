export default function formatNumberWithSuffix(num: number) {
  if (num >= 1.0e9) {
    return Math.floor(num / 1.0e9) + "B"; // Billions (B)
  }
  if (num >= 1.0e6) {
    return Math.floor(num / 1.0e6) + "M"; // Millions (M)
  }
  if (num >= 1.0e3) {
    return Math.floor(num / 1.0e3) + "K"; // Thousands (K)
  }
  return String(num);
}
