import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardBody } from "@/components/ui/Card";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mb-6 text-sm text-slate-500">One account for flights, hotels, and tours.</p>
      <Card>
        <CardBody>
          <RegisterForm />
        </CardBody>
      </Card>
    </div>
  );
}
