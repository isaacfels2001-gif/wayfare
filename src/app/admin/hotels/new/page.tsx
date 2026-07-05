import { HotelForm } from "@/components/admin/HotelForm";
import { createHotelAction } from "@/lib/actions/admin/hotels";

export default function NewHotelPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add hotel</h1>
      <p className="mt-1 text-sm text-slate-500">You can add room types after creating the hotel.</p>
      <div className="mt-6">
        <HotelForm action={createHotelAction} defaults={{}} />
      </div>
    </div>
  );
}
