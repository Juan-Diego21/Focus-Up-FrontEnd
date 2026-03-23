import { apiClient } from "@shared/services/apiClient";
import { API_ENDPOINTS } from "@shared/config/constants";

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
  // Se usa como identificador principal para actualizaciones de progreso.
  id_metodo_realizado: number;
  id_metodo: number;
  progreso: number;
  estado: string;
  // IDs alternos devueltos por backend (id_reporte, id_metodo_realizado, etc.).
  candidateIds: number[];
  raw: unknown;
}

interface UpdateMethodProgressParams {
  sessionId: string | number;
  progress: number;
  status?: string;
  finalize?: boolean;
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

const toUniquePositiveNumbers = (values: unknown[]): number[] => {
  const unique = new Set<number>();

  values.forEach((value) => {
    const parsed = toNumber(value, 0);
    if (parsed > 0) {
      unique.add(parsed);
    }
  });

  return Array.from(unique);
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
  // Se prioriza id_reporte para updates porque PATCH /reports/methods/{id}/progress
  // usa normalmente el ID del reporte activo.
  const candidateIds = toUniquePositiveNumbers([
    data?.id_reporte,
    data?.id_metodo_realizado,
    data?.idMetodoRealizado,
    data?.id,
  ]);
  const id = candidateIds[0] || 0;

  if (!id) return null;

  return {
    source: "created",
    id_metodo_realizado: id,
    id_metodo: toNumber(data?.id_metodo ?? data?.idMetodo, 0),
    progreso: toNumber(data?.progreso ?? data?.progress, 0),
    estado: String(data?.estado ?? data?.status ?? "en_progreso"),
    candidateIds,
    raw: data,
  };
};

const normalizeResumedSession = (item: ActiveMethodReport): EnsuredMethodSession | null => {
  const candidateIds = toUniquePositiveNumbers([
    item.id_reporte,
    item.id_metodo_realizado,
    item.idMetodoRealizado,
  ]);
  const id = candidateIds[0] || 0;

  if (!id) return null;

  return {
    source: "resumed",
    id_metodo_realizado: id,
    id_metodo: toNumber(item.id_metodo ?? item.idMetodo, 0),
    progreso: toNumber(item.progreso ?? item.progress, 0),
    estado: getStatus(item),
    candidateIds,
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

const normalizeServerStatus = (status: string | undefined, progress: number): "pending" | "completed" => {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (progress >= 100 || COMPLETED_STATUSES.has(normalized)) return "completed";
  return "pending";
};

const normalizeClientStatus = (status: string | undefined, progress: number): string => {
  const normalized = String(status ?? "").trim();
  if (normalized) return normalized;
  return progress >= 100 ? "completado" : "en_progreso";
};

const getStoredCandidateIds = (): number[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem("activeMethodCandidateIds");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return toUniquePositiveNumbers(parsed);
  } catch {
    return [];
  }
};

const getPayloadVariants = (params: UpdateMethodProgressParams, sessionId: number): Array<Record<string, unknown>> => {
  const shouldFinalize = params.finalize ?? params.progress >= 100;
  const serverStatus = normalizeServerStatus(params.status, params.progress);
  const clientStatus = normalizeClientStatus(params.status, params.progress);
  const legacyStatus = serverStatus === "completed" ? "completado" : "activo";
  const timestamp = new Date().toISOString();

  const rawVariants: Array<Record<string, unknown>> = [
    { progreso: params.progress },
    { progreso: params.progress, finalizar: shouldFinalize },
    { progreso: params.progress, estado: clientStatus },
    { progreso: params.progress, status: serverStatus, estado: serverStatus, finalizar: shouldFinalize },
    { progreso: params.progress, status: serverStatus },
    { progress: params.progress, status: serverStatus, estado: serverStatus, finalizar: shouldFinalize },
    {
      idMetodoActivo: sessionId,
      progreso: params.progress,
      estado: legacyStatus,
      fechaActualizacion: timestamp,
    },
  ];

  const seen = new Set<string>();
  const variants: Array<Record<string, unknown>> = [];

  rawVariants.forEach((variant) => {
    const sanitized = Object.fromEntries(
      Object.entries(variant).filter(([, value]) => value !== undefined)
    );
    const key = JSON.stringify(sanitized);
    if (seen.has(key)) return;
    seen.add(key);
    variants.push(sanitized);
  });

  return variants;
};

const getProgressEndpointCandidates = (sessionId: number): string[] => {
  return [
    `${API_ENDPOINTS.METHOD_PROGRESS}/${sessionId}/progress`,
    `${API_ENDPOINTS.ACTIVE_METHODS}/${sessionId}/progress`,
    `${API_ENDPOINTS.METHOD_PROGRESS}/${sessionId}`,
    `${API_ENDPOINTS.ACTIVE_METHODS}/${sessionId}`,
  ];
};

export const persistMethodCandidateIds = (candidateIds: number[]): void => {
  if (typeof window === "undefined") return;

  const ids = toUniquePositiveNumbers(candidateIds);
  if (!ids.length) return;
  localStorage.setItem("activeMethodCandidateIds", JSON.stringify(ids));
};

export const clearMethodCandidateIds = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("activeMethodCandidateIds");
};

export const updateMethodProgress = async (params: UpdateMethodProgressParams): Promise<void> => {
  const sessionIds = toUniquePositiveNumbers([
    params.sessionId,
    ...getStoredCandidateIds(),
  ]);

  if (!sessionIds.length) {
    throw new Error("No se encontró un identificador válido para actualizar el progreso.");
  }

  let lastErrorMessage = "No se pudo actualizar el progreso del método.";

  for (const sessionId of sessionIds) {
    const endpoints = getProgressEndpointCandidates(sessionId);
    const payloads = getPayloadVariants(params, sessionId);

    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        try {
          await apiClient.patch(endpoint, payload);
          return;
        } catch (error: any) {
          lastErrorMessage = error?.message || lastErrorMessage;
        }
      }
    }
  }

  throw new Error(lastErrorMessage);
};


