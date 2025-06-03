import { configureStore } from "@reduxjs/toolkit";
import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  CartItem,
} from "../../../../lib/redux/slices/cartSlice";
import { Product, ProductCategories } from "../../../../lib/types/product.types";

describe("cartSlice", () => {
  let store: ReturnType<typeof configureStore>;

  const mockProduct1: Product = {
    id: "1",
    name: "burger cheese",
    price: 15000,
    description: "Hamburguesa con queso y tocino",
    category: "bugers" as ProductCategories.burgers,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockProduct2: Product = {
    id: "2",
    name: "burger pepperoni",
    price: 18000,
    description: "burger con pepperoni y champiñones",
    category: "bugers" as ProductCategories.burgers,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const initialState: { items: CartItem[]; total: number } = {
    items: [],
    total: 0,
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cart: cartReducer,
      },
    });
  });

  describe("Initial state", () => {
    it("should return the initial state", () => {
      expect(cartReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });
  });

  describe("addItem action", () => {
    it("should add a new item to empty cart", () => {
      const action = addItem(mockProduct1);
      const state = cartReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({
        ...mockProduct1,
        quantity: 1,
      });
      expect(state.total).toBe(15000);
    });

    it("should increment quantity if item already exists", () => {
      const stateWithItem: { items: CartItem[]; total: number } = {
        items: [{ ...mockProduct1, quantity: 1 }],
        total: 15000,
      };

      const action = addItem(mockProduct1);
      const state = cartReducer(stateWithItem, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
      expect(state.total).toBe(30000);
    });

    it("should add different items to cart", () => {
      const stateWithItem = {
        items: [{ ...mockProduct1, quantity: 1 }],
        total: 15000,
      };

      const action = addItem(mockProduct2);
      const state = cartReducer(stateWithItem, action);

      expect(state.items).toHaveLength(2);
      expect(state.items[0]).toEqual({ ...mockProduct1, quantity: 1 });
      expect(state.items[1]).toEqual({ ...mockProduct2, quantity: 1 });
      expect(state.total).toBe(33000);
    });

    it("should calculate total correctly with multiple items", () => {
      let state = cartReducer(initialState, addItem(mockProduct1));
      state = cartReducer(state, addItem(mockProduct1));
      state = cartReducer(state, addItem(mockProduct2));

      expect(state.items).toHaveLength(2);
      expect(state.items[0].quantity).toBe(2);
      expect(state.items[1].quantity).toBe(1);
      expect(state.total).toBe(48000); 
    });
  });

  describe("removeItem action", () => {
    it("should remove item from cart", () => {
      const stateWithItems: { items: CartItem[]; total: number } = {
        items: [
          { ...mockProduct1, quantity: 2 },
          { ...mockProduct2, quantity: 1 },
        ],
        total: 48000,
      };

      const action = removeItem(mockProduct1.id);
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({ ...mockProduct2, quantity: 1 });
      expect(state.total).toBe(18000);
    });

    it("should handle removing non-existing item gracefully", () => {
      const stateWithItems: { items: CartItem[]; total: number } = {
        items: [{ ...mockProduct1, quantity: 1 }],
        total: 15000,
      };

      const action = removeItem("non-existing-id");
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({ ...mockProduct1, quantity: 1 });
      expect(state.total).toBe(15000);
    });

    it("should clear cart when removing last item", () => {
      const stateWithOneItem: { items: CartItem[]; total: number } = {
        items: [{ ...mockProduct1, quantity: 1 }],
        total: 15000,
      };

      const action = removeItem(mockProduct1.id);
      const state = cartReducer(stateWithOneItem, action);

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

  describe("updateQuantity action", () => {
    it("should update quantity of existing item", () => {
      const stateWithItems: { items: CartItem[]; total: number } = {
        items: [
          { ...mockProduct1, quantity: 1 },
          { ...mockProduct2, quantity: 2 },
        ],
        total: 51000,
      };

      const action = updateQuantity({ id: mockProduct1.id, quantity: 3 });
      const state = cartReducer(stateWithItems, action);

      expect(state.items[0].quantity).toBe(3);
      expect(state.items[1].quantity).toBe(2);
      expect(state.total).toBe(81000); 
    });

    it("should update quantity to zero", () => {
      const stateWithItems: { items: CartItem[]; total: number } = {
        items: [{ ...mockProduct1, quantity: 5 }],
        total: 75000,
      };

      const action = updateQuantity({ id: mockProduct1.id, quantity: 0 });
      const state = cartReducer(stateWithItems, action);

      expect(state.items[0].quantity).toBe(0);
      expect(state.total).toBe(0);
    });

    it("should handle updating non-existing item gracefully", () => {
      const stateWithItems = {
        items: [{ ...mockProduct1, quantity: 1 }],
        total: 15000,
      };

      const action = updateQuantity({ id: "non-existing-id", quantity: 5 });
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(1);
      expect(state.total).toBe(15000);
    });

    it("should update multiple items correctly", () => {
      const stateWithItems: { items: CartItem[]; total: number } = {
        items: [
          { ...mockProduct1, quantity: 1 },
          { ...mockProduct2, quantity: 1 },
        ],
        total: 33000,
      };

      let state = cartReducer(
        stateWithItems,
        updateQuantity({ id: mockProduct1.id, quantity: 4 })
      );
      state = cartReducer(
        state,
        updateQuantity({ id: mockProduct2.id, quantity: 2 })
      );

      expect(state.items[0].quantity).toBe(4);
      expect(state.items[1].quantity).toBe(2);
      expect(state.total).toBe(96000); 
    });
  });

  describe("clearCart action", () => {
    it("should clear all items from cart", () => {
      const stateWithItems: { items: CartItem[]; total: number } = {
        items: [
          { ...mockProduct1, quantity: 3 },
          { ...mockProduct2, quantity: 2 },
        ],
        total: 81000,
      };

      const action = clearCart();
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });

    it("should handle clearing empty cart", () => {
      const action = clearCart();
      const state = cartReducer(initialState, action);

      expect(state.items).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

  describe("Integration tests with store", () => {
    it("should handle complex cart operations", async () => {
     
      store.dispatch(addItem(mockProduct1));
      store.dispatch(addItem(mockProduct2));
      store.dispatch(addItem(mockProduct1)); 

      let state = (store.getState() as { cart: typeof initialState }).cart;
      expect(state.items).toHaveLength(2);
      expect(state.items[0].quantity).toBe(2);
      expect(state.items[1].quantity).toBe(1);
      expect(state.total).toBe(48000);

      
      store.dispatch(updateQuantity({ id: mockProduct2.id, quantity: 3 }));
      state = (store.getState() as { cart: typeof initialState }).cart;
      expect(state.total).toBe(84000); 
      
      store.dispatch(removeItem(mockProduct1.id));
      state = (store.getState() as { cart: typeof initialState }).cart;
      expect(state.items).toHaveLength(1);
      expect(state.total).toBe(54000);

      
      store.dispatch(clearCart());
      state = (store.getState() as { cart: typeof initialState }).cart;
      expect(state).toEqual(initialState);
    });

    it("should maintain cart state consistency", async () => {
      const actions = [
        addItem(mockProduct1),
        addItem(mockProduct2),
        addItem(mockProduct1),
        updateQuantity({ id: mockProduct1.id, quantity: 5 }),
        addItem(mockProduct2),
      ];

      actions.forEach(action => store.dispatch(action));

      const state = (store.getState() as { cart: typeof initialState }).cart;
      const expectedTotal = state.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );

      expect(state.total).toBe(expectedTotal);
    });
  });

  describe("Total calculation", () => {
    it("should calculate total correctly with single item", () => {
      const action = addItem(mockProduct1);
      const state = cartReducer(initialState, action);

      expect(state.total).toBe(mockProduct1.price);
    });

    it("should calculate total correctly with multiple quantities of same item", () => {
      let state = cartReducer(initialState, addItem(mockProduct1));
      state = cartReducer(state, addItem(mockProduct1));
      state = cartReducer(state, addItem(mockProduct1));

      expect(state.total).toBe(mockProduct1.price * 3);
    });

    it("should calculate total correctly with different items and quantities", () => {
      let state = cartReducer(initialState, addItem(mockProduct1));
      state = cartReducer(state, addItem(mockProduct2));
      state = cartReducer(state, updateQuantity({ id: mockProduct1.id, quantity: 2 }));
      state = cartReducer(state, updateQuantity({ id: mockProduct2.id, quantity: 3 }));

      const expectedTotal = (mockProduct1.price * 2) + (mockProduct2.price * 3);
      expect(state.total).toBe(expectedTotal);
    });

    it("should recalculate total after removing items", () => {
      let state = cartReducer(initialState, addItem(mockProduct1));
      state = cartReducer(state, addItem(mockProduct2));
      state = cartReducer(state, addItem(mockProduct1));


      expect(state.total).toBe(48000);

     
      state = cartReducer(state, removeItem(mockProduct1.id));
      expect(state.total).toBe(18000);
    });
  });
});