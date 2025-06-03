import { getOrderStateColor } from "../../../lib/utils/order";
import { OrderState } from "../../../lib/types/order.types";

describe("Order Utils - getOrderStateColor", () => {
  test("returns correct color for OrderState.Pending", () => {
    const result = getOrderStateColor(OrderState.Pending);
    expect(result).toBe("bg-yellow-100 text-yellow-800");
  });

  test("returns correct color for OrderState.Preparing", () => {
    const result = getOrderStateColor(OrderState.Preparing);
    expect(result).toBe("bg-blue-100 text-blue-800");
  });

  test("returns correct color for OrderState.Ready", () => {
    const result = getOrderStateColor(OrderState.Ready);
    expect(result).toBe("bg-purple-100 text-purple-800");
  });

  test("returns correct color for OrderState.OnTheWay", () => {
    const result = getOrderStateColor(OrderState.OnTheWay);
    expect(result).toBe("bg-orange-100 text-orange-800");
  });

  test("returns correct color for OrderState.Delivered", () => {
    const result = getOrderStateColor(OrderState.Delivered);
    expect(result).toBe("bg-green-100 text-green-800");
  });

  test("returns correct color for OrderState.Cancelled", () => {
    const result = getOrderStateColor(OrderState.Cancelled);
    expect(result).toBe("bg-red-100 text-red-800");
  });

  test("returns default color for unknown state", () => {
    const result = getOrderStateColor("UNKNOWN" as OrderState);
    expect(result).toBe("bg-gray-100 text-gray-800");
  });

  test("handles all enum values and returns formatted color strings", () => {
    const allStates = Object.values(OrderState);
    allStates.forEach((state) => {
      const result = getOrderStateColor(state);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^bg-\w+-100 text-\w+-800$/);
    });
  });

  test("gracefully handles null or invalid input", () => {
    const result = getOrderStateColor(null as any);
    expect(result).toBe("bg-gray-100 text-gray-800");
  });
});
