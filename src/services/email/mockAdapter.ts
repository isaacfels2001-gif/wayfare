import { prisma } from "@/lib/db";
import type { EmailProvider, SendEmailParams, SendEmailResult } from "./types";

/**
 * Does not actually deliver mail — logs to the console and writes an
 * EmailLog row so the flow is fully demoable and auditable without a real
 * ESP account. Clearly labeled as a mock; see EmailProvider for the swap
 * point.
 */
export class MockEmailProvider implements EmailProvider {
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    const providerMessageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    console.log(
      `[mock-email] to=${params.to} subject="${params.subject}" template=${params.template} id=${providerMessageId}`
    );

    await prisma.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        template: params.template,
        status: "sent",
        bodyPreview: params.html.replace(/<[^>]+>/g, " ").slice(0, 500),
        bookingId: params.bookingId,
      },
    });

    return { success: true, providerMessageId };
  }
}
