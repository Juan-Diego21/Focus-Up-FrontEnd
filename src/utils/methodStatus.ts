// Shared utilities for method status handling across Pomodoro and Mind Maps

export type MethodStatus = 'en_progreso' | 'completado' | 'En_proceso' | 'Casi_terminando' | 'Terminado';

export interface MethodStatusInfo {
  status: MethodStatus;
  label: string;
  color: string;
}

// Standardized status mappings matching backend validation
export const METHOD_STATUS: Record<string, MethodStatusInfo> = {
  // Pomodoro statuses (English with underscore)
  en_progreso: {
    status: 'en_progreso',
    label: 'En proceso',
    color: '#FACC15' // Yellow
  },
  completado: {
    status: 'completado',
    label: 'Terminado',
    color: '#22C55E' // Green
  },
  // Mind Maps statuses (Spanish with accents)
  En_proceso: {
    status: 'En_proceso',
    label: 'En proceso',
    color: '#FACC15' // Yellow
  },
  Casi_terminando: {
    status: 'Casi_terminando',
    label: 'Casi terminando',
    color: '#3B82F6' // Blue
  },
  Terminado: {
    status: 'Terminado',
    label: 'Terminado',
    color: '#22C55E' // Green
  }
};

// Progress to status mapping for Mind Maps
export const getMindMapsStatusByProgress = (progress: number): MethodStatus => {
  if (progress === 20 || progress === 40) return 'En_proceso';
  if (progress === 60 || progress === 80) return 'Casi_terminando';
  if (progress === 100) return 'Terminado';
  return 'En_proceso'; // Default
};

// Status to color mapping
export const getStatusColor = (status: MethodStatus): string => {
  return METHOD_STATUS[status]?.color || METHOD_STATUS.in_process.color;
};

// Status to label mapping
export const getStatusLabel = (status: MethodStatus): string => {
  return METHOD_STATUS[status]?.label || METHOD_STATUS.in_process.label;
};

// Progress to color mapping for Mind Maps
export const getMindMapsColorByProgress = (progress: number): string => {
  const status = getMindMapsStatusByProgress(progress);
  return getStatusColor(status);
};

// Progress to label mapping for Mind Maps
export const getMindMapsLabelByProgress = (progress: number): string => {
  const status = getMindMapsStatusByProgress(progress);
  return getStatusLabel(status);
};

// Method detection utilities
export const isMindMapsMethod = (methodName: string): boolean => {
  return methodName.toLowerCase().includes('mapa') || methodName.toLowerCase().includes('mentales');
};

export const isPomodoroMethod = (methodName: string): boolean => {
  return methodName.toLowerCase().includes('pomodoro');
};

// Get method type from method data
export const getMethodType = (method: any): 'pomodoro' | 'mindmaps' | 'unknown' => {
  if (!method) return 'unknown';
  const name = method.nombre || method.titulo || '';
  if (isPomodoroMethod(name)) return 'pomodoro';
  if (isMindMapsMethod(name)) return 'mindmaps';
  return 'unknown';
};

// Progress validation utilities
export const VALID_PROGRESS_VALUES = {
  pomodoro: {
    creation: [0],
    update: [0, 50, 100]
  },
  mindmaps: {
    creation: [20], // Mind Maps cannot start at 0%, must start at 20%
    update: [20, 40, 60, 80, 100]
  }
} as const;

/**
 * Validates if a progress value is valid for session creation
 * @param progress - The progress value to validate
 * @param methodType - The method type ('pomodoro' | 'mindmaps')
 * @returns true if valid for creation, false otherwise
 */
export const isValidProgressForCreation = (progress: number, methodType: 'pomodoro' | 'mindmaps'): boolean => {
  const validValues = VALID_PROGRESS_VALUES[methodType].creation;
  return (validValues as readonly number[]).includes(progress);
};

/**
 * Validates if a progress value is valid for session update
 * @param progress - The progress value to validate
 * @param methodType - The method type ('pomodoro' | 'mindmaps')
 * @returns true if valid for update, false otherwise
 */
export const isValidProgressForUpdate = (progress: number, methodType: 'pomodoro' | 'mindmaps'): boolean => {
  const validValues = VALID_PROGRESS_VALUES[methodType].update;
  return (validValues as readonly number[]).includes(progress);
};

/**
 * Gets the next valid progress value for a method type
 * @param currentProgress - Current progress value
 * @param methodType - The method type
 * @param direction - 'next' or 'prev'
 * @returns The next valid progress value, or null if none available
 */
export const getNextValidProgress = (
  currentProgress: number,
  methodType: 'pomodoro' | 'mindmaps',
  direction: 'next' | 'prev' = 'next'
): number | null => {
  const validValues = VALID_PROGRESS_VALUES[methodType].update;
  const currentIndex = validValues.indexOf(currentProgress as any);

  if (currentIndex === -1) return null;

  if (direction === 'next' && currentIndex < validValues.length - 1) {
    return validValues[currentIndex + 1];
  } else if (direction === 'prev' && currentIndex > 0) {
    return validValues[currentIndex - 1];
  }

  return null;
};

/**
 * Validates progress for session resume
 * @param progress - The progress value from saved session
 * @param methodType - The method type
 * @returns true if valid for resume, false otherwise
 */
export const isValidProgressForResume = (progress: number, methodType: 'pomodoro' | 'mindmaps'): boolean => {
  // For resume, we allow any valid update value, but not 0 for Mind Maps
  if (methodType === 'mindmaps' && progress === 0) return false;
  return isValidProgressForUpdate(progress, methodType);
};