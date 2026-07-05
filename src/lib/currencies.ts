export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
