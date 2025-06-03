import { reportApi } from "../../../lib/api/reportApi";

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;


const mockStorage = {
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn(),
  clear: jest.fn(),
};


const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("ReportApi", () => {
  const mockToken = "test-admin-token";
  const mockReportResponse = {
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getToken.mockReturnValue(mockToken);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("getDailyReport", () => {
    
    it("should handle empty base64 response", async () => {
      const emptyResponse = { base64: "" };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => emptyResponse,
      } as Response);

      const result = await reportApi.getDailyReport();

      expect(result.base64).toBe("");
    });

    it("should handle very large base64 response", async () => {
      const largeBase64 = "A".repeat(100000);
      const largeResponse = { base64: largeBase64 };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => largeResponse,
      } as Response);

      const result = await reportApi.getDailyReport();

      expect(result.base64).toBe(largeBase64);
      expect(result.base64.length).toBe(100000);
    });
  });

  describe("getWeeklyReport", () => {

    it("should use correct endpoint for weekly reports", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReportResponse,
      } as Response);

      await reportApi.getWeeklyReport();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("weekly"),
        expect.any(Object)
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining("daily"),
        expect.any(Object)
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining("monthly"),
        expect.any(Object)
      );
    });
  });

  describe("getMothlyReport", () => {
    

    it("should use correct endpoint for monthly reports", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReportResponse,
      } as Response);

      await reportApi.getMothlyReport();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("monthly"),
        expect.any(Object)
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining("daily"),
        expect.any(Object)
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining("weekly"),
        expect.any(Object)
      );
    });

    it("should handle method name typo (getMothlyReport)", async () => {
      // This test documents the existing typo in the method name
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReportResponse,
      } as Response);

      // Should still work despite the typo in method name
      const result = await reportApi.getMothlyReport();

      expect(result).toEqual(mockReportResponse);
    });
  });

  describe("Error handling", () => {
    it("should handle HTTP errors for daily report", async () => {
      const errorMessage = "Unauthorized access to reports";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: errorMessage }),
      } as Response);

      await expect(reportApi.getDailyReport()).rejects.toThrow(errorMessage);
    });

    it("should handle HTTP errors for weekly report", async () => {
      const errorMessage = "Forbidden";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: errorMessage }),
      } as Response);

      await expect(reportApi.getWeeklyReport()).rejects.toThrow(errorMessage);
    });

    it("should handle HTTP errors for monthly report", async () => {
      const errorMessage = "Internal Server Error";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: errorMessage }),
      } as Response);

      await expect(reportApi.getMothlyReport()).rejects.toThrow(errorMessage);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(reportApi.getDailyReport()).rejects.toThrow("Network error");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "API request failed:",
        expect.any(Error)
      );
    });

    it("should handle malformed error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as Response);

      await expect(reportApi.getWeeklyReport()).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });

    it("should handle error without message in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      } as Response);

      await expect(reportApi.getMothlyReport()).rejects.toThrow(
        "HTTP error! status: 404"
      );
    });

    it("should handle response.json() throwing error for successful requests", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("JSON parse error");
        },
      } as unknown as Response);

      await expect(reportApi.getDailyReport()).rejects.toThrow(
        "JSON parse error"
      );
    });

    it("should handle timeout errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Request timeout"));

      await expect(reportApi.getWeeklyReport()).rejects.toThrow(
        "Request timeout"
      );
    });
  });

  describe("Request configuration", () => {
    it("should include correct headers and credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReportResponse,
      } as Response);

      await reportApi.getDailyReport();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: "include",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
        })
      );
    });

    it("should handle request without token", async () => {
      mockStorage.getToken.mockReturnValue(null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReportResponse,
      } as Response);

      await reportApi.getWeeklyReport();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it("should handle empty token", async () => {
      mockStorage.getToken.mockReturnValue("");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReportResponse,
      } as Response);

          await reportApi.getMothlyReport();
    
          expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              headers: expect.not.objectContaining({
                Authorization: expect.any(String),
              }),
            })
          );
        });
      });
    });

    