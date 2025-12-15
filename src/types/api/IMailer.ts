// Interfaz para servicio de envío de correos (API)
export interface IEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Uint8Array | string;
    contentType?: string;
  }>;
}

export interface IMailer {
  // Envío básico de correos
  sendEmail(options: IEmailOptions): Promise<boolean>;

  // Plantillas de correo predefinidas
  sendWelcomeEmail(email: string, userData: { nombre: string; username: string }): Promise<boolean>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean>;
  sendSessionReminder(email: string, sessionData: { titulo: string; fecha: Date }): Promise<boolean>;
  sendWeeklyReport(email: string, reportData: Record<string, any>): Promise<boolean>;

  // Verificación y validación
  validateEmail(email: string): boolean;
  isEmailServiceAvailable(): Promise<boolean>;

  // Gestión de colas (si aplica)
  getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    failed: number;
  }>;
}