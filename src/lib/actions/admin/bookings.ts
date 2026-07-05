"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { releaseBookingInventory } from "@/services/booking";

export async function cancelBookingAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await releaseBookingInventory(id, "cancelled");
  revalidatePath("/admin/bookings");
}
