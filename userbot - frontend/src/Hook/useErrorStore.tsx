import { create } from "zustand";

interface ErrorItem {
  id: string;
  txt: string;
}

interface ErrorState {
  errors: ErrorItem[];
  showError: (txt: string) => void;
  removeError: (id: string) => void;
}

export default create<ErrorState>((set) => ({
  errors: [],
  showError: (txt) => {
    const id = crypto.randomUUID();
    set((state) => {
      const updated = [...state.errors, { id, txt }];
      const fitt =
        updated.length > 3 ? updated.slice(updated.length - 3) : updated;
      return { errors: fitt };
    });

    setTimeout(() => {
      set((state) => ({
        errors: state.errors.filter((error) => error.id !== id),
      }));
    }, 4000);
  },
  removeError: (id) => {
    set((state) => ({
      errors: state.errors.filter((error) => error.id !== id),
    }));
  },
}));
