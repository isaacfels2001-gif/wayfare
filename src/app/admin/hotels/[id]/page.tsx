import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { HotelForm } from "@/components/admin/HotelForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { updateHotelAction, createRoomAction, updateRoomAction, deleteRoomAction } from "@/lib/actions/admin/hotels";
import { formatMoney } from "@/lib/money";

const usdRate = { USD: { rateToUsd: 1, symbol: "$", name: "US Dollar" } };

export default async function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hotel = await prisma.hotel.findUnique({ where: { id }, include: { rooms: true } });
  if (!hotel) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit hotel</h1>
      <div className="mt-6">
        <HotelForm action={updateHotelAction} defaults={hotel} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Room types</h2>
      <div className="mt-3 space-y-3">
        {hotel.rooms.map((room) => (
          <Card key={room.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{room.name}</div>
                  <div className="text-sm text-slate-500">
                    {room.bedType} · Sleeps {room.maxOccupancy} · {room.totalRooms} available · {formatMoney(room.pricePerNightCents, "USD", usdRate)}/night
                  </div>
                </div>
                <form action={deleteRoomAction}>
                  <input type="hidden" name="id" value={room.id} />
                  <input type="hidden" name="hotelId" value={hotel.id} />
                  <DeleteButton />
                </form>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-blue-600">Edit room</summary>
                <RoomFields action={updateRoomAction} hotelId={hotel.id} defaults={room} />
              </details>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardBody>
          <h3 className="font-medium text-slate-900">Add a room type</h3>
          <RoomFields action={createRoomAction} hotelId={hotel.id} defaults={{}} />
        </CardBody>
      </Card>
    </div>
  );
}

interface RoomDefaults {
  id?: string;
  name?: string;
  description?: string;
  maxOccupancy?: number;
  bedType?: string;
  pricePerNightCents?: number;
  totalRooms?: number;
  amenitiesCsv?: string;
}

function RoomFields({ action, hotelId, defaults }: { action: (formData: FormData) => void; hotelId: string; defaults: RoomDefaults }) {
  return (
    <form action={action} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="hotelId" value={hotelId} />
      <div>
        <Label htmlFor={`name-${defaults.id ?? "new"}`}>Room name</Label>
        <Input id={`name-${defaults.id ?? "new"}`} name="name" defaultValue={defaults.name} required />
      </div>
      <div>
        <Label htmlFor={`bedType-${defaults.id ?? "new"}`}>Bed type</Label>
        <Input id={`bedType-${defaults.id ?? "new"}`} name="bedType" defaultValue={defaults.bedType} required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`description-${defaults.id ?? "new"}`}>Description</Label>
        <Input id={`description-${defaults.id ?? "new"}`} name="description" defaultValue={defaults.description} required />
      </div>
      <div>
        <Label htmlFor={`maxOccupancy-${defaults.id ?? "new"}`}>Max occupancy</Label>
        <Input id={`maxOccupancy-${defaults.id ?? "new"}`} name="maxOccupancy" type="number" min={1} defaultValue={defaults.maxOccupancy ?? 2} required />
      </div>
      <div>
        <Label htmlFor={`pricePerNight-${defaults.id ?? "new"}`}>Price / night ($)</Label>
        <Input
          id={`pricePerNight-${defaults.id ?? "new"}`}
          name="pricePerNight"
          type="number"
          min={1}
          step="0.01"
          defaultValue={defaults.pricePerNightCents ? defaults.pricePerNightCents / 100 : 150}
          required
        />
      </div>
      <div>
        <Label htmlFor={`totalRooms-${defaults.id ?? "new"}`}>Rooms available</Label>
        <Input id={`totalRooms-${defaults.id ?? "new"}`} name="totalRooms" type="number" min={0} defaultValue={defaults.totalRooms ?? 10} required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`amenities-${defaults.id ?? "new"}`}>Amenities (comma-separated)</Label>
        <Input id={`amenities-${defaults.id ?? "new"}`} name="amenities" defaultValue={defaults.amenitiesCsv} required />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm">
          {defaults.id ? "Update room" : "Add room"}
        </Button>
      </div>
    </form>
  );
}
