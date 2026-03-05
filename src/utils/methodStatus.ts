/**
 * Shared study-method status and progress utilities.
 */

export type MethodStatus =
  | 'en_progreso'
  | 'completado'
  | 'cancelado'
  | 'En_proceso'
  | 'Casi_terminando'
  | 'Terminado'
  | 'avanzando'
  | 'casi_terminando'
  | 'finalizado'
  | 'no_iniciado'
  | 'pausado';

export interface MethodStatusInfo {
  status: MethodStatus;
  label: string;
  color: string;
}

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const METHOD_STATUS: Record<string, MethodStatusInfo> = {
  en_progreso: { status: 'en_progreso', label: 'En proceso', color: '#FACC15' },
  completado: { status: 'completado', label: 'Terminado', color: '#22C55E' },
  cancelado: { status: 'cancelado', label: 'Cancelado', color: '#EF4444' },
  En_proceso: { status: 'En_proceso', label: 'En proceso', color: '#FACC15' },
  Casi_terminando: { status: 'Casi_terminando', label: 'Casi terminando', color: '#3B82F6' },
  Terminado: { status: 'Terminado', label: 'Terminado', color: '#22C55E' },
  avanzando: { status: 'avanzando', label: 'Avanzando', color: '#3B82F6' },
  casi_terminando: { status: 'casi_terminando', label: 'Casi terminando', color: '#3B82F6' },
  finalizado: { status: 'finalizado', label: 'Finalizado', color: '#22C55E' },
  no_iniciado: { status: 'no_iniciado', label: 'No iniciado', color: '#9CA3AF' },
  pausado: { status: 'pausado', label: 'Pausado', color: '#F59E0B' },
};

export const getMindMapsStatusByProgress = (progress: number): MethodStatus => {
  if (progress === 20 || progress === 40) return 'En_proceso';
  if (progress === 60 || progress === 80) return 'Casi_terminando';
  if (progress === 100) return 'Terminado';
  return 'En_proceso';
};

export const getStatusColor = (status: MethodStatus): string => {
  return METHOD_STATUS[status]?.color || METHOD_STATUS.En_proceso.color;
};

export const getStatusLabel = (status: MethodStatus): string => {
  return METHOD_STATUS[status]?.label || METHOD_STATUS.En_proceso.label;
};

export const getMindMapsColorByProgress = (progress: number): string => {
  return getStatusColor(getMindMapsStatusByProgress(progress));
};

export const getMindMapsLabelByProgress = (progress: number): string => {
  return getStatusLabel(getMindMapsStatusByProgress(progress));
};

export const getSpacedRepetitionStatusByProgress = (progress: number): MethodStatus => {
  if (progress === 20 || progress === 40) return 'En_proceso';
  if (progress === 60 || progress === 80) return 'Casi_terminando';
  if (progress === 100) return 'Terminado';
  return 'En_proceso';
};

export const getSpacedRepetitionColorByProgress = (progress: number): string => {
  return getStatusColor(getSpacedRepetitionStatusByProgress(progress));
};

export const getSpacedRepetitionLabelByProgress = (progress: number): string => {
  return getStatusLabel(getSpacedRepetitionStatusByProgress(progress));
};

export const getActiveRecallStatusByProgress = (progress: number): MethodStatus => {
  if (progress === 100) return 'completado';
  return 'en_progreso';
};

export const getActiveRecallColorByProgress = (progress: number): string => {
  return getStatusColor(getActiveRecallStatusByProgress(progress));
};

export const getActiveRecallLabelByProgress = (progress: number): string => {
  return getStatusLabel(getActiveRecallStatusByProgress(progress));
};

export const getFeynmanStatusByProgress = (progress: number): MethodStatus => {
  if (progress === 20) return 'en_progreso';
  if (progress === 40) return 'avanzando';
  if (progress === 60 || progress === 80) return 'casi_terminando';
  if (progress === 100) return 'finalizado';
  return 'en_progreso';
};

export const getFeynmanColorByProgress = (progress: number): string => {
  return getStatusColor(getFeynmanStatusByProgress(progress));
};

export const getFeynmanLabelByProgress = (progress: number): string => {
  return getStatusLabel(getFeynmanStatusByProgress(progress));
};

export const getCornellStatusByProgress = (progress: number): MethodStatus => {
  if (progress === 20 || progress === 40) return 'En_proceso';
  if (progress === 60 || progress === 80) return 'Casi_terminando';
  if (progress === 100) return 'Terminado';
  return 'En_proceso';
};

export const getCornellColorByProgress = (progress: number): string => {
  return getStatusColor(getCornellStatusByProgress(progress));
};

export const getCornellLabelByProgress = (progress: number): string => {
  return getStatusLabel(getCornellStatusByProgress(progress));
};

export const isMindMapsMethod = (methodName: string): boolean => {
  const name = normalizeText(methodName);
  return name.includes('mapa') || name.includes('mentales') || name.includes('mind map');
};

export const isPomodoroMethod = (methodName: string): boolean => {
  const name = normalizeText(methodName);
  return name.includes('pomodoro') || name.includes('tecnica pomodoro') || name.includes('pomodoro technique');
};

export const isSpacedRepetitionMethod = (methodName: string): boolean => {
  const name = normalizeText(methodName);
  return (
    (name.includes('repaso') && name.includes('espaciado')) ||
    (name.includes('spaced') && name.includes('repetition')) ||
    name.includes('repeticion espaciada')
  );
};

export const isActiveRecallMethod = (methodName: string): boolean => {
  const name = normalizeText(methodName);
  return (
    (name.includes('practica') && name.includes('activa')) ||
    (name.includes('active') && name.includes('recall')) ||
    name.includes('recuerdo activo')
  );
};

export const isFeynmanMethod = (methodName: string): boolean => {
  const name = normalizeText(methodName);
  return name.includes('feynman') || name.includes('metodo feynman') || name.includes('feynman technique');
};

export const isCornellMethod = (methodName: string): boolean => {
  const name = normalizeText(methodName);
  return name.includes('cornell') || name.includes('metodo cornell') || name.includes('cornell method');
};

export const getMethodType = (
  method: any
): 'pomodoro' | 'mindmaps' | 'spacedrepetition' | 'activerecall' | 'feynman' | 'cornell' | 'unknown' => {
  if (!method) return 'unknown';
  const name = method.nombre || method.nombre_metodo || method.titulo || '';
  if (isPomodoroMethod(name)) return 'pomodoro';
  if (isMindMapsMethod(name)) return 'mindmaps';
  if (isSpacedRepetitionMethod(name)) return 'spacedrepetition';
  if (isActiveRecallMethod(name)) return 'activerecall';
  if (isFeynmanMethod(name)) return 'feynman';
  if (isCornellMethod(name)) return 'cornell';
  return 'unknown';
};

export const VALID_PROGRESS_VALUES = {
  pomodoro: {
    creation: [0, 20],
    update: [0, 20, 40, 50, 60, 80, 100],
  },
  mindmaps: {
    creation: [20],
    update: [20, 40, 60, 80, 100],
  },
  spacedrepetition: {
    creation: [20],
    update: [20, 40, 60, 80, 100],
  },
  activerecall: {
    creation: [0, 20, 40, 60, 80, 100],
    update: [0, 20, 40, 50, 60, 80, 100],
  },
  feynman: {
    creation: [0, 20],
    update: [20, 40, 60, 80, 100],
  },
  cornell: {
    creation: [20],
    update: [20, 40, 60, 80, 100],
  },
} as const;

export const isValidProgressForCreation = (
  progress: number,
  methodType: 'pomodoro' | 'mindmaps' | 'spacedrepetition' | 'activerecall' | 'feynman' | 'cornell'
): boolean => {
  const validValues = VALID_PROGRESS_VALUES[methodType].creation;
  return (validValues as readonly number[]).includes(progress);
};

export const isValidProgressForUpdate = (
  progress: number,
  methodType: 'pomodoro' | 'mindmaps' | 'spacedrepetition' | 'activerecall' | 'feynman' | 'cornell'
): boolean => {
  const validValues = VALID_PROGRESS_VALUES[methodType].update;
  return (validValues as readonly number[]).includes(progress);
};

export const getNextValidProgress = (
  currentProgress: number,
  methodType: 'pomodoro' | 'mindmaps' | 'spacedrepetition' | 'activerecall' | 'feynman' | 'cornell',
  direction: 'next' | 'prev' = 'next'
): number | null => {
  const validValues = VALID_PROGRESS_VALUES[methodType].update;
  const currentIndex = validValues.indexOf(currentProgress as any);

  if (currentIndex === -1) return null;

  if (direction === 'next' && currentIndex < validValues.length - 1) {
    return validValues[currentIndex + 1];
  }

  if (direction === 'prev' && currentIndex > 0) {
    return validValues[currentIndex - 1];
  }

  return null;
};

export const isValidProgressForResume = (
  progress: number,
  methodType: 'pomodoro' | 'mindmaps' | 'spacedrepetition' | 'activerecall' | 'feynman' | 'cornell'
): boolean => {
  if ((methodType === 'mindmaps' || methodType === 'spacedrepetition' || methodType === 'activerecall' || methodType === 'feynman' || methodType === 'cornell') && progress === 0) {
    return false;
  }
  return isValidProgressForUpdate(progress, methodType);
};
