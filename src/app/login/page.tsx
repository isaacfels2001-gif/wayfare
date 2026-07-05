import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardBody } from "@/components/ui/Card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mb-6 text-sm text-slate-500">Sign in to manage your bookings and itinerary.</p>
      <Card>
        <CardBody>
          <LoginForm callbackUrl={callbackUrl || "/account"} />
        </CardBody>
      </Card>
    </div>
  );
}
