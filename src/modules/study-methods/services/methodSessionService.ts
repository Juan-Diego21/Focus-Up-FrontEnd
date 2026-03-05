import { apiClient } from "../../../utils/apiClient";
import { API_ENDPOINTS } from "../../../utils/constants";

type SessionSource = "created" | "resumed";

interface EnsureMethodSessionParams {
  methodId: number;
  initialProgress: number;
  initialStatus?: string;
}

interface ActiveMethodReport {
  id_reporte?: number;
  id_metodo?: number;
  progreso?: number;
  estado?: string;
  id_metodo_realizado?: number;
  idMetodoRealizado?: number;
  idMetodo?: number;
  progress?: number;
  status?: string;
}

export interface EnsuredMethodSession {
  source: SessionSource;
  id_metodo_realizado: number;
  id_metodo: number;
  progreso: number;
  estado: string;
  raw: unknown;
}

const COMPLETED_STATUSES = new Set([
  "completado",
  "terminado",
  "finalizado",
  "completed",
]);

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getStatus = (item: ActiveMethodReport): string => {
  return String(item.estado ?? item.status ?? "en_progreso");
};

const isCompleted = (item: ActiveMethodReport): boolean => {
  const progress = toNumber(item.progreso ?? item.progress, 0);
  const status = getStatus(item).toLowerCase();
  return progress >= 100 || COMPLETED_STATUSES.has(status);
};

const normalizeResponseArray = (payload: any): ActiveMethodReport[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const normalizeCreatedSession = (payload: any): EnsuredMethodSession | null => {
  const data = payload?.data ?? payload;
  const id = toNumber(
    data?.id_metodo_realizado ?? data?.idMetodoRealizado ?? data?.id_reporte ?? data?.id,
    0
  );

  if (!id) return null;

  return {
    source: "created",
    id_metodo_realizado: id,
    id_metodo: toNumber(data?.id_metodo ?? data?.idMetodo, 0),
    progreso: toNumber(data?.progreso ?? data?.progress, 0),
    estado: String(data?.estado ?? data?.status ?? "en_progreso"),
    raw: data,
  };
};

const normalizeResumedSession = (item: ActiveMethodReport): EnsuredMethodSession | null => {
  const id = toNumber(
    item.id_reporte ?? item.id_metodo_realizado ?? item.idMetodoRealizado,
    0
  );

  if (!id) return null;

  return {
    source: "resumed",
    id_metodo_realizado: id,
    id_metodo: toNumber(item.id_metodo ?? item.idMetodo, 0),
    progreso: toNumber(item.progreso ?? item.progress, 0),
    estado: getStatus(item),
    raw: item,
  };
};

const getExistingActiveSession = async (methodId: number): Promise<EnsuredMethodSession | null> => {
  const response = await apiClient.get(API_ENDPOINTS.METHOD_PROGRESS);
  const reports = normalizeResponseArray(response);
  const active = reports.find((item) => toNumber(item.id_metodo ?? item.idMetodo, 0) === methodId && !isCompleted(item));
  return active ? normalizeResumedSession(active) : null;
};

const buildPayloadVariants = (params: EnsureMethodSessionParams): Array<Record<string, unknown>> => {
  const variants: Array<Record<string, unknown>> = [];
  const base = { id_metodo: params.methodId };

  if (params.initialStatus) {
    variants.push({ ...base, estado: params.initialStatus, progreso: params.initialProgress });
  }
  variants.push({ ...base, progreso: params.initialProgress });

  if (params.initialStatus) {
    variants.push({ ...base, estado: params.initialStatus, progreso: 0 });
  }
  variants.push({ ...base, progreso: 0 });
  variants.push(base);

  const seen = new Set<string>();
  return variants.filter((variant) => {
    const key = JSON.stringify(variant);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const ensureMethodSession = async (
  params: EnsureMethodSessionParams
): Promise<EnsuredMethodSession> => {
  try {
    const existing = await getExistingActiveSession(params.methodId);
    if (existing) return existing;
  } catch {
    // Continue with creation flow when listing reports fails.
  }

  const payloads = buildPayloadVariants(params);
  let lastErrorMessage = "No se pudo crear o reanudar la sesión del método.";

  for (const payload of payloads) {
    try {
      const createResponse = await apiClient.post(API_ENDPOINTS.ACTIVE_METHODS, payload);
      const created = normalizeCreatedSession(createResponse);

      if (created) return created;

      const existing = await getExistingActiveSession(params.methodId);
      if (existing) return existing;
    } catch (error: any) {
      lastErrorMessage = error?.message || lastErrorMessage;

      try {
        const existing = await getExistingActiveSession(params.methodId);
        if (existing) return existing;
      } catch {
        // Keep trying next payload variant.
      }
    }
  }

  throw new Error(lastErrorMessage);
};

