import type { Property } from "@/config/site";
import { db } from "./db";

export type Arrival = {
  address: string | null;
  checkInMethod: string | null;
  doorCode: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  parking: string;
  notes: string[];
};

// Private details come from the database (entered in /admin → Arrival Info);
// parking and notes fall back to the defaults in site config.
export async function getArrival(property: Property): Promise<Arrival> {
  const row = await db.propertyArrival.findUnique({ where: { propertySlug: property.slug } });
  const notes = row?.notes
    ? row.notes.split("\n").map((n) => n.trim()).filter(Boolean)
    : property.arrival.notes;
  return {
    address: row?.address || null,
    checkInMethod: row?.checkInMethod || null,
    doorCode: row?.doorCode || null,
    wifiName: row?.wifiName || null,
    wifiPassword: row?.wifiPassword || null,
    parking: row?.parking || property.arrival.parking,
    notes,
  };
}
