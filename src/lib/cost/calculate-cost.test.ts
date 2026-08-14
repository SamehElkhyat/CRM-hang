import { describe, expect, it } from "vitest";
import { calculateBookingCost, calculateNights } from "./calculate-cost";
import type { ChildPolicy } from "@/types/database.types";

const policy: ChildPolicy = {
  currency: "EGP",
  free_age_limit: 6,
  extra_bed: { min_age: 7, max_age: 12, charge: 300 },
  adult_extra_bed_charge: 500,
};

describe("calculateNights", () => {
  it("computes whole nights between two dates", () => {
    expect(calculateNights("2026-09-01", "2026-09-04")).toBe(3);
  });

  it("throws when checkout is not after checkin", () => {
    expect(() => calculateNights("2026-09-04", "2026-09-04")).toThrow();
    expect(() => calculateNights("2026-09-05", "2026-09-04")).toThrow();
  });
});

describe("calculateBookingCost", () => {
  it("charges only room subtotal with no children", () => {
    const result = calculateBookingCost({
      checkIn: "2026-09-01",
      checkOut: "2026-09-04",
      baseRate: 1200,
      childrenAges: [],
      childPolicy: policy,
    });
    expect(result.nights).toBe(3);
    expect(result.roomSubtotal).toBe(3600);
    expect(result.childChargesTotal).toBe(0);
    expect(result.total).toBe(3600);
  });

  it("gives free stay for a child under the free age limit", () => {
    const result = calculateBookingCost({
      checkIn: "2026-09-01",
      checkOut: "2026-09-03",
      baseRate: 1000,
      childrenAges: [4],
      childPolicy: policy,
    });
    expect(result.childCharges[0].charge).toBe(0);
    expect(result.total).toBe(2000);
  });

  it("applies the extra-bed child charge within the bracket", () => {
    const result = calculateBookingCost({
      checkIn: "2026-09-01",
      checkOut: "2026-09-03",
      baseRate: 1000,
      childrenAges: [9],
      childPolicy: policy,
    });
    expect(result.childCharges[0].charge).toBe(600); // 300 * 2 nights
    expect(result.total).toBe(2600);
  });

  it("falls back to the adult extra-bed charge above the child bracket", () => {
    const result = calculateBookingCost({
      checkIn: "2026-09-01",
      checkOut: "2026-09-03",
      baseRate: 1000,
      childrenAges: [15],
      childPolicy: policy,
    });
    expect(result.childCharges[0].charge).toBe(1000); // 500 * 2 nights
    expect(result.total).toBe(3000);
  });

  it("handles multiple children with mixed brackets", () => {
    const result = calculateBookingCost({
      checkIn: "2026-09-01",
      checkOut: "2026-09-05",
      baseRate: 800,
      childrenAges: [3, 9, 15],
      childPolicy: policy,
    });
    // 4 nights: room 3200, child1 free, child2 300*4=1200, child3 500*4=2000
    expect(result.nights).toBe(4);
    expect(result.roomSubtotal).toBe(3200);
    expect(result.childChargesTotal).toBe(3200);
    expect(result.total).toBe(6400);
  });
});
