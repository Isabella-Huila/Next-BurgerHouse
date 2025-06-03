import { configureStore } from "@reduxjs/toolkit";
import usersSlice, {
  fetchUsers,
  updateUser,
  deleteUser,
  setFilters,
  setPageLimit,
  clearError,
  resetUsers,
} from "@/lib/redux/slices/usersSlice";
import { usersApi } from "@/lib/api/userApi";

jest.mock("@/lib/api/userApi");
const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;

const mockUsers = [
  {
    id: "1",
    email: "user1@test.com",
    fullName: "User One",
    isActive: true,
    roles: ["customer"],
  },
  {
    id: "2",
    email: "user2@test.com",
    fullName: "User Two",
    isActive: false,
    roles: ["admin"],
  },
];

describe("usersSlice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: usersSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe("reducers", () => {
    it("should handle setFilters", () => {
      const filters = { isActive: true, roles: ["admin"] };
      store.dispatch(setFilters(filters));

      const state = store.getState().users;
      expect(state.filters).toEqual(filters);
    });

    it("should handle setPageLimit", () => {
      store.dispatch(setPageLimit(25));

      const state = store.getState().users;
      expect(state.pagination.limit).toBe(25);
    });

    it("should handle clearError", () => {
      store.dispatch(fetchUsers.rejected(new Error("Test error"), "", {}));
      expect(store.getState().users.error).toBeTruthy();

      store.dispatch(clearError());
      expect(store.getState().users.error).toBeNull();
    });

    it("should handle resetUsers", () => {
      store.dispatch(setPageLimit(50));
      store.dispatch(setFilters({ isActive: true }));

      store.dispatch(resetUsers());

      const state = store.getState().users;
      expect(state.users).toEqual([]);
      expect(state.pagination.limit).toBe(10);
      expect(state.filters).toEqual({});
    });
  });

  describe("fetchUsers async thunk", () => {
    it("should handle fetchUsers.pending", () => {
      store.dispatch(fetchUsers.pending("", {}));

      const state = store.getState().users;
      expect(state.loading.fetch).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fetchUsers.fulfilled with array response", () => {
      store.dispatch(fetchUsers.fulfilled(mockUsers, "", {}));

      const state = store.getState().users;
      expect(state.loading.fetch).toBe(false);
      expect(state.users).toEqual(mockUsers);
      expect(state.pagination.total).toBe(mockUsers.length);
    });

    it("should handle fetchUsers.fulfilled with object response", () => {
      const response = {
        data: mockUsers,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      };

      store.dispatch(fetchUsers.fulfilled(response, "", {}));

      const state = store.getState().users;
      expect(state.users).toEqual(mockUsers);
      expect(state.pagination.total).toBe(2);
    });

    it("should call API with correct parameters", async () => {
      mockUsersApi.getAllUsers.mockResolvedValue({
        data: mockUsers,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });

      await store.dispatch(fetchUsers({ limit: 25 }));

      expect(mockUsersApi.getAllUsers).toHaveBeenCalledWith({ limit: 25 });
    });

    it("should handle fetchUsers.rejected", () => {
      const errorMessage = "Network error";
      store.dispatch(fetchUsers.rejected(null, "", {}, errorMessage));

      const state = store.getState().users;
      expect(state.loading.fetch).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("should handle fetchUsers.fulfilled with unexpected payload", () => {
      const response = { unexpected: "format" };

      store.dispatch(fetchUsers.fulfilled(response as any, "", {}));

      const state = store.getState().users;
      expect(state.users).toEqual([]);
      expect(state.pagination.total).toBe(0);
    });
      
  });

  describe("updateUser async thunk", () => {
    it("should handle updateUser.pending", () => {
      store.dispatch(
        updateUser.pending("", { email: "test@test.com", updateData: {} })
      );

      const state = store.getState().users;
      expect(state.loading.update).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle updateUser.fulfilled", () => {
      store.dispatch(fetchUsers.fulfilled(mockUsers, "", {}));

      const updatedUser = { ...mockUsers[0], fullName: "Updated Name" };
      store.dispatch(
        updateUser.fulfilled(updatedUser, "", {
          email: "user1@test.com",
          updateData: { fullName: "Updated Name" },
        })
      );

      const state = store.getState().users;
      expect(state.loading.update).toBe(false);
      expect(state.users[0].fullName).toBe("Updated Name");
    });

    it("should handle updateUser.rejected", () => {
      const errorMessage = "Update failed";
      store.dispatch(
        updateUser.rejected(
          null,
          "",
          { email: "user1@test.com", updateData: {} },
          errorMessage
        )
      );

      const state = store.getState().users;
      expect(state.loading.update).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("should not update user if user does not exist", () => {
      const updatedUser = {
        ...mockUsers[0],
        email: "nonexistent@test.com",
        fullName: "Updated",
      };

      store.dispatch(
        updateUser.fulfilled(updatedUser, "", {
          email: "nonexistent@test.com",
          updateData: { fullName: "Updated" },
        })
      );

      const state = store.getState().users;
      expect(
        state.users.find((u) => u.email === "nonexistent@test.com")
      ).toBeUndefined();
    });
    
    
  });

  describe("deleteUser async thunk", () => {
    it("should handle deleteUser.pending", () => {
      store.dispatch(deleteUser.pending("", "test@test.com"));

      const state = store.getState().users;
      expect(state.loading.delete).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle deleteUser.fulfilled", () => {
      store.dispatch(fetchUsers.fulfilled(mockUsers, "", {}));

      store.dispatch(
        deleteUser.fulfilled("user1@test.com", "", "user1@test.com")
      );

      const state = store.getState().users;
      expect(state.loading.delete).toBe(false);
      expect(state.users).toHaveLength(1);
      expect(state.users[0].email).toBe("user2@test.com");
      expect(state.pagination.total).toBe(1);
    });

    it("should handle deleteUser.rejected", () => {
      const errorMessage = "Delete failed";
      store.dispatch(
        deleteUser.rejected(null, "", "user1@test.com", errorMessage)
      );

      const state = store.getState().users;
      expect(state.loading.delete).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
    
  });
});
