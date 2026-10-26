import { site } from "@/config/site";
import { addDays, daysBetween, todayLocal } from "./dates";

export type TripStage = "refundable" | "insider" | "arrival" | "staying" | "departed";

export function tripTimeline(checkIn: string, checkOut: string, today = todayLocal()) {
  const unlockDate = addDays(checkIn, -site.policies.refundWindowDays);
  const arrivalDate = addDays(checkIn, -site.policies.arrivalDetailsDays);
  let stage: TripStage;
  if (today >= checkOut) stage = "departed";
  else if (today >= checkIn) stage = "staying";
  else if (today >= arrivalDate) stage = "arrival";
  else if (today >= unlockDate) stage = "insider";
  else stage = "refundable";

  return {
    stage,
    unlockDate,
    arrivalDate,
    refundable: stage === "refundable",
    insiderUnlocked: stage !== "refundable",
    arrivalDetailsVisible: stage === "arrival" || stage === "staying",
    guestPassActive: stage === "staying",
    daysUntilCheckIn: daysBetween(today, checkIn),
    daysUntilUnlock: Math.max(0, daysBetween(today, unlockDate)),
  };
}
