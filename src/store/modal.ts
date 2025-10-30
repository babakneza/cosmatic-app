import { create } from 'zustand';

interface LoginModalState {
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

/**
 * Global modal state management for login modal
 * Used when token expires and user needs to re-authenticate
 */
export const useLoginModal = create<LoginModalState>((set) => ({
    isOpen: false,
    isLoading: false,
    error: null,

    openLoginModal: () => set({ isOpen: true, error: null }),
    closeLoginModal: () => set({ isOpen: false, error: null, isLoading: false }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
}));