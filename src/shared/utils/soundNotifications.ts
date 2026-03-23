// Utilidades de notificaciones sonoras para temporizadores.
// Se implementa con Web Audio API para evitar dependencias externas
// y mantener una alarma suave tipo campana.

let sharedAudioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextCtor();
  }

  return sharedAudioContext;
};

export const primeNotificationAudio = async (): Promise<void> => {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      // Algunos navegadores bloquean resume fuera de gesto de usuario.
    }
  }
};

interface TimerAlarmOptions {
  volume?: number;
  repeatCount?: number;
  repeatGapSeconds?: number;
}

export const playSoftTimerEndAlarm = (options: TimerAlarmOptions = {}): void => {
  const context = getAudioContext();
  if (!context) return;

  const volume = Math.min(Math.max(options.volume ?? 0.22, 0), 1);
  const repeatCount = Math.max(1, Math.floor(options.repeatCount ?? 5));
  const repeatGapSeconds = Math.max(0.45, options.repeatGapSeconds ?? 1);
  const now = context.currentTime;

  if (context.state === "suspended") {
    void context.resume().catch(() => {
      // Ignore resume failures triggered outside trusted gestures.
    });
  }

  const notes = [
    { freq: 784, start: 0.0, duration: 0.16 }, // G5
    { freq: 1046.5, start: 0.20, duration: 0.24 }, // C6
  ];

  for (let repeatIndex = 0; repeatIndex < repeatCount; repeatIndex += 1) {
    const cycleOffset = repeatIndex * repeatGapSeconds;

    notes.forEach((note) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const noteStart = now + cycleOffset + note.start;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.freq, noteStart);

      gainNode.gain.setValueAtTime(0.0001, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(volume, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(noteStart);
      oscillator.stop(noteStart + note.duration + 0.02);
    });
  }
};

let tabAttentionInterval: number | null = null;
let tabAttentionTimeout: number | null = null;
let tabAttentionListenersBound = false;
let originalTitle = "";
let visibilityStopHandler: (() => void) | null = null;

const stopTabAttention = (): void => {
  if (typeof window === "undefined") return;

  if (tabAttentionInterval !== null) {
    window.clearInterval(tabAttentionInterval);
    tabAttentionInterval = null;
  }

  if (tabAttentionTimeout !== null) {
    window.clearTimeout(tabAttentionTimeout);
    tabAttentionTimeout = null;
  }

  if (originalTitle) {
    document.title = originalTitle;
  }

  if (tabAttentionListenersBound) {
    window.removeEventListener("focus", stopTabAttention);
    window.removeEventListener("pointerdown", stopTabAttention);
    window.removeEventListener("keydown", stopTabAttention);
    if (visibilityStopHandler) {
      document.removeEventListener("visibilitychange", visibilityStopHandler);
    }
    visibilityStopHandler = null;
    tabAttentionListenersBound = false;
  }
};

interface TabAttentionOptions {
  message?: string;
  blinkIntervalMs?: number;
  durationMs?: number;
}

export const startTimerEndTabAttention = (options: TabAttentionOptions = {}): void => {
  if (typeof window === "undefined") return;

  stopTabAttention();
  originalTitle = document.title;

  const message = options.message ?? "⏰ Temporizador finalizado";
  const blinkIntervalMs = Math.max(300, options.blinkIntervalMs ?? 700);
  const durationMs = Math.max(4000, options.durationMs ?? 12000);
  let showAlertTitle = true;

  tabAttentionInterval = window.setInterval(() => {
    document.title = showAlertTitle ? message : originalTitle;
    showAlertTitle = !showAlertTitle;
  }, blinkIntervalMs);

  tabAttentionTimeout = window.setTimeout(() => {
    stopTabAttention();
  }, durationMs);

  window.addEventListener("focus", stopTabAttention);
  window.addEventListener("pointerdown", stopTabAttention);
  window.addEventListener("keydown", stopTabAttention);
  visibilityStopHandler = () => {
    if (document.visibilityState === "visible") {
      stopTabAttention();
    }
  };
  document.addEventListener("visibilitychange", visibilityStopHandler);
  tabAttentionListenersBound = true;
};
