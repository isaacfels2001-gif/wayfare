import { TourForm } from "@/components/admin/TourForm";
import { createTourAction } from "@/lib/actions/admin/tours";

export default function NewTourPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add tour package</h1>
      <p className="mt-1 text-sm text-slate-500">You can add departure dates after creating the package.</p>
      <div className="mt-6">
        <TourForm action={createTourAction} defaults={{}} />
      </div>
    </div>
  );
}
