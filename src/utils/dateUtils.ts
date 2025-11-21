export function parseLocalDate(dateString: string): { day: number; month: number; year: number } {
  if (!dateString || typeof dateString !== "string") {
    return { day: 0, month: 0, year: 0 };
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return { day, month, year };
}

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

export function formatLocalDateReadable(dateString: string): string {
  const { day, month, year } = parseLocalDate(dateString);
  if (!day || !month || !year) return "Fecha inválida";

  return `${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}