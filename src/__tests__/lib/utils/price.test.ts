import { formatPrice } from "../../../lib/utils/price";

describe("Price Utils - formatPrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(Intl, "NumberFormat").mockImplementation(() => ({
      format: (value: number) => `$${Math.round(value)}`,
    }) as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("formats integer price correctly", () => {
    const result = formatPrice(25000);
    expect(result).toBe("$25000");

    expect(Intl.NumberFormat).toHaveBeenCalledWith("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  });

  test("formats decimal price with rounding", () => {
    const result = formatPrice(25500.75);
    expect(result).toBe("$25501");
    expect(Intl.NumberFormat).toHaveBeenCalledTimes(1);
  });

  test("handles zero price", () => {
    const result = formatPrice(0);
    expect(result).toBe("$0");
  });

  test("handles negative price", () => {
    const result = formatPrice(-1000);
    expect(result).toBe("$-1000");
  });

  test("handles very large number", () => {
    const result = formatPrice(1_000_000_000);
    expect(result).toBe("$1000000000");
  });

  test("handles small decimals with rounding", () => {
    const result = formatPrice(0.99);
    expect(result).toBe("$1");
  });

  test("uses correct Intl.NumberFormat config", () => {
    formatPrice(50000);

    expect(Intl.NumberFormat).toHaveBeenCalledWith("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  });

  test("throws error when Intl.NumberFormat fails", () => {
    jest.restoreAllMocks(); 
    jest.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
      throw new Error("NumberFormat error");
    });

    expect(() => formatPrice(1000)).toThrow("NumberFormat error");
  });
});
