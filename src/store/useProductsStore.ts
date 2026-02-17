import { create } from "zustand";
import type { Product } from "../api/products";

interface ProductsState {
  localProducts: Product[];
  selectedProducts: number[];
  excludedApiProducts: number[];
  addLocalProduct: (product: Product) => void;
  removeLocalProduct: (id: number) => void;
  addExcludedProduct: (id: number) => void;
  clearExcludedProducts: () => void;
  toggleProductSelection: (id: number) => void;
  selectAllProducts: (productIds: number[]) => void;
  deselectAllProducts: () => void;
  clearLocalProducts: () => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
  localProducts: [],
  selectedProducts: [],
  excludedApiProducts: [],

  addLocalProduct: (product) =>
    set((state) => ({
      localProducts: [product, ...state.localProducts],
    })),

  removeLocalProduct: (id) =>
    set((state) => ({
      localProducts: state.localProducts.filter((p) => p.id !== id),
      selectedProducts: state.selectedProducts.filter((pId) => pId !== id),
    })),

  toggleProductSelection: (id) =>
    set((state) => {
      const isSelected = state.selectedProducts.includes(id);
      return {
        selectedProducts: isSelected
          ? state.selectedProducts.filter((pId) => pId !== id)
          : [...state.selectedProducts, id],
      };
    }),

  selectAllProducts: (productIds) => set({ selectedProducts: productIds }),

  deselectAllProducts: () => set({ selectedProducts: [] }),

  clearLocalProducts: () => set({ localProducts: [] }),

  addExcludedProduct: (id) =>
    set((state) => ({
      excludedApiProducts: [...state.excludedApiProducts, id],
      selectedProducts: state.selectedProducts.filter((pId) => pId !== id),
    })),

  clearExcludedProducts: () => set({ excludedApiProducts: [] }),
}));
