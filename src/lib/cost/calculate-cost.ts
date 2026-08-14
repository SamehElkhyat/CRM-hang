import type { ChildPolicy } from "@/types/database.types";

export interface CostCalculationInput {
  checkIn: string;
  checkOut: string;
  baseRate: number;
  childrenAges: number[];
  childPolicy: ChildPolicy;
}

export interface ChildCharge {
  age: number;
  charge: number;
  reason: string;
}

export interface CostBreakdown {
  nights: number;
  roomSubtotal: number;
  childCharges: ChildCharge[];
  childChargesTotal: number;
  total: number;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const msPerNight = 24 * 60 * 60 * 1000;
  const nights = Math.round((outDate.getTime() - inDate.getTime()) / msPerNight);

  if (!Number.isFinite(nights) || nights <= 0) {
    throw new Error("تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول");
  }
  return nights;
}

function chargeForChild(age: number, nights: number, policy: ChildPolicy): ChildCharge {
  const freeAgeLimit = policy.free_age_limit ?? 0;
  if (age <= freeAgeLimit) {
    return { age, charge: 0, reason: "إقامة مجانية ضمن سياسة الفندق" };
  }

  const extraBed = policy.extra_bed;
  if (extraBed && age >= extraBed.min_age && age <= extraBed.max_age) {
    return {
      age,
      charge: round2(extraBed.charge * nights),
      reason: `سرير إضافي للطفل (${extraBed.min_age}-${extraBed.max_age} سنة)`,
    };
  }

  const adultCharge = policy.adult_extra_bed_charge ?? 0;
  return {
    age,
    charge: round2(adultCharge * nights),
    reason: "يُحتسب كسرير إضافي بسعر البالغ",
  };
}

export function calculateBookingCost(input: CostCalculationInput): CostBreakdown {
  const nights = calculateNights(input.checkIn, input.checkOut);
  const roomSubtotal = round2(nights * input.baseRate);

  const childCharges = input.childrenAges.map((age) =>
    chargeForChild(age, nights, input.childPolicy),
  );
  const childChargesTotal = round2(
    childCharges.reduce((sum, c) => sum + c.charge, 0),
  );

  return {
    nights,
    roomSubtotal,
    childCharges,
    childChargesTotal,
    total: round2(roomSubtotal + childChargesTotal),
  };
}
