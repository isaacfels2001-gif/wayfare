"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Price } from "@/components/currency/Price";
import { useFxRates } from "@/components/currency/CurrencyProvider";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { previewPromoAction, startCheckoutAction } from "@/lib/actions/checkout";
import { X } from "lucide-react";

const TYPE_LABEL: Record<string, string> = { flight: "Flight", hotel: "Hotel", tour: "Tour" };

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const rates = useFxRates();
  const router = useRouter();

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountCents, setDiscountCents] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoPending, setPromoPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);

  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const totalCents = Math.max(0, subtotalCents - discountCents);

  async function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoPending(true);
    setPromoError(null);
    const result = await previewPromoAction(
      promoInput,
      subtotalCents,
      items.map((i) => i.type)
    );
    setPromoPending(false);
    if (result.error) {
      setPromoError(result.error);
      setDiscountCents(0);
      setAppliedPromo(null);
      return;
    }
    setDiscountCents(result.discountCents);
    setAppliedPromo(promoInput.toUpperCase().trim());
  }

  async function handleCheckout() {
    setCheckoutPending(true);
    setCheckoutError(null);
    const result = await startCheckoutAction({
      items: items.map((i) => ({ type: i.type, quantity: i.quantity, ref: i.ref })),
      promoCode: appliedPromo ?? undefined,
    });
    setCheckoutPending(false);

    if (result.requiresLogin) {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    if (result.error) {
      setCheckoutError(result.error);
      return;
    }
    if (result.url) {
      clear();
      window.location.href = result.url;
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Search flights, hotels, or tours and add them to your trip.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/flights" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            Find flights
          </Link>
          <Link href="/hotels" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Find hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Your trip</h1>
      <p className="mt-1 text-sm text-slate-500">Combine flights, hotels, and tours in a single checkout.</p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardBody className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.title} className="h-16 w-20 rounded-md object-cover" />
                  )}
                  <div>
                    <Badge tone="blue" className="mb-1.5">
                      {TYPE_LABEL[item.type]}
                    </Badge>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.subtitle}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(item.startDate)} → {formatDate(item.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-slate-900">
                    <Price usdCents={item.unitPriceCents * item.quantity} />
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardBody>
              <h2 className="font-semibold text-slate-900">Order summary</h2>

              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="md" onClick={handleApplyPromo} disabled={promoPending}>
                  {promoPending ? "…" : "Apply"}
                </Button>
              </div>
              {promoError && <p className="mt-1.5 text-xs font-medium text-rose-600">{promoError}</p>}
              {appliedPromo && discountCents > 0 && !promoError && (
                <p className="mt-1.5 text-xs font-medium text-emerald-600">Code {appliedPromo} applied</p>
              )}

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <Price usdCents={subtotalCents} />
                </div>
                {discountCents > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatMoney(discountCents, "USD", rates.USD ? { USD: rates.USD } : {})}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <Price usdCents={totalCents} />
                </div>
                <p className="text-[11px] text-slate-400">Charged in USD at checkout. Other currencies shown for reference only.</p>
              </div>

              {checkoutError && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{checkoutError}</p>}

              <Button fullWidth className="mt-4" onClick={handleCheckout} disabled={checkoutPending}>
                {checkoutPending ? "Processing…" : "Proceed to checkout"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
