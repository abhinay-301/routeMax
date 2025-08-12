import { create } from "zustand";
import { persist } from "zustand/middleware";
import routsData from "../data/Download routes.json";
import stopsData from "../data/Download stops.json";

const useMyStore = create(
  persist(
    (set, get) => ({
      // We'll load persisted routes if available, otherwise fallback to JSON
      routes: routsData,
      stops: stopsData,
      selectedRouts: [],
      selectedStops: [],
      theme: "light",

      updateSelectedRoutes: (newRoute: []) => {
        set({ selectedRouts: newRoute });
      },

      updateSelectedStops: (newStops: []) => {
        set({ selectedStops: newStops });
      },

      updateTheme: (newTheme: string) => {
        set({ theme: newTheme });
      },

      updateRoutesStatus: (routeName: string, newStatus: string) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.Route === routeName
              ? { ...route, Status: newStatus }
              : route
          ),
        }));
      },
      updateRouteName: (routeName: string, newName: string) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.Route === routeName
              ? { ...route, Route: newName }
              : route
          ),
        }));
      },
      updateRouteType: (routeName: string, newType: string) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.Route === routeName
              ? {
                 ...route,
                 ["Route Type"]: newType }
              : route
          ),
        }));
      },
    }),
    {
      name: "my-zustand-store", // localStorage key
      // Persist everything(specify only according to need)
      partialize: (state) => ({
        routes: state.routes,
        selectedRouts: state.selectedRouts,
        selectedStops: state.selectedStops,
        theme: state.theme,
      }),
    }
  )
);

export default useMyStore;
