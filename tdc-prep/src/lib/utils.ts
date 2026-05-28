import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function formatScore(score: number | null | undefined) {
  if (score == null) return "—";
  return `${(score * 100).toFixed(0)}%`;
}

export const CATEGORY_LABEL: Record<string, string> = {
  shannon: "Teoría de la Información",
  fisico: "Nivel Físico",
  osi: "Arquitectura",
  enlace: "Nivel Enlace",
  red: "Nivel Red",
  ruteo: "Ruteo",
  transporte: "Nivel Transporte",
  aplicacion: "Nivel Aplicación",
  cripto: "Criptografía",
  seguridad: "Seguridad",
};

export const CATEGORY_COLOR: Record<string, string> = {
  shannon: "#48d6e2",
  fisico: "#5aa5ff",
  osi: "#3ee0a3",
  enlace: "#3ee0a3",
  red: "#f5c64a",
  ruteo: "#f5c64a",
  transporte: "#ff944d",
  aplicacion: "#e066ff",
  cripto: "#ff5b6e",
  seguridad: "#ff5b6e",
};
