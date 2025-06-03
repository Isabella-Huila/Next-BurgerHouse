import { formatDate } from "../../../lib/utils/date";

const mockDate = new Date('2024-03-15T14:30:00.000Z');

describe("Date Utils - formatDate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful formatting", () => {
    beforeEach(() => {
      // Mock para resultados consistentes
      jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(() => {
        return 'March 15, 2024 at 02:30 PM';
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("formats a valid ISO date string correctly", () => {
      const dateString = "2024-03-15T14:30:00.000Z";
      const result = formatDate(dateString);

      expect(result).toBe('March 15, 2024 at 02:30 PM');
      expect(Date.prototype.toLocaleDateString).toHaveBeenCalledWith('en-es', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    test("formats another valid ISO date string", () => {
      const dateString = "2024-12-25T23:59:59.999Z";
      formatDate(dateString);
      expect(Date.prototype.toLocaleDateString).toHaveBeenCalledTimes(1);
    });
  });

  test("creates Date object from input string", () => {
    const dateString = "2024-03-15T14:30:00.000Z";
    const originalDate = Date;
    const mockDateConstructor = jest.fn(() => mockDate);
    global.Date = mockDateConstructor as any;

    formatDate(dateString);

    expect(mockDateConstructor).toHaveBeenCalledWith(dateString);
    global.Date = originalDate;
  });

  test("returns 'Invalid Date' for invalid input", () => {
    const result = formatDate("invalid-date");
    expect(result).toContain("Invalid Date");
  });

  test("throws if Intl formatting fails", () => {
    jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(() => {
      throw new Error("Intl error");
    });

    expect(() => formatDate("2024-03-15T14:30:00.000Z")).toThrow("Intl error");
  });
});
