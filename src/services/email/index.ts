import { MockEmailProvider } from "./mockAdapter";
import type { EmailProvider } from "./types";

function createEmailProvider(): EmailProvider {
  const kind = process.env.EMAIL_PROVIDER ?? "mock";
  switch (kind) {
    // case "resend": return new ResendEmailProvider();
    // case "sendgrid": return new SendgridEmailProvider();
    case "mock":
    default:
      return new MockEmailProvider();
  }
}

export const emailProvider: EmailProvider = createEmailProvider();
export * from "./types";
