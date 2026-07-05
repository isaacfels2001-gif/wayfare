export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  bookingId?: string;
  template: string;
}

export interface SendEmailResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

/**
 * Contract every transactional-email sender must satisfy. The mock adapter
 * just logs + records to EmailLog. Swap EMAIL_PROVIDER for a real one
 * (Resend, SendGrid, Postmark) once credentials exist — nothing else in the
 * booking flow needs to change.
 */
export interface EmailProvider {
  send(params: SendEmailParams): Promise<SendEmailResult>;
}
