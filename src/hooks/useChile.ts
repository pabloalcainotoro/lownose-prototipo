import { CHILE_DATA } from "@/utils/chile";

export const useChile = () => {
  const regiones = Object.keys(CHILE_DATA);
  const getComunas = (region: string) => CHILE_DATA[region] || [];
  
  return { regiones, getComunas };
};