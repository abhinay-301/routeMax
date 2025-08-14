import { create } from "zustand";
import { persist } from "zustand/middleware";
import routsData from "../data/Download routes.json";
import stopsData from "../data/Download stops.json";
import type { MyStore,Route,Stop } from "./types";

const useMyStore = create<MyStore>()(
  persist(
    (set, get) => ({
      // We'll load persisted routes if available, otherwise fallback to JSON
      routes: routsData,
      stops: stopsData,
      selectedRouts: [],
      selectedStops: [],
      themeValue: "light",

      updateSelectedRoutes: (newRoute: Route[]) => {
        set({ selectedRouts: newRoute });
      },

      updateSelectedStops: (newStops: Stop[]) => {
        set({ selectedStops: newStops });
      },

      updateTheme: (newTheme: "light" | "dark") => {
        set({ themeValue: newTheme });
      },

      updateRoutesStatus: (routeName: string, newStatus: string) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.Route === routeName ? { ...route, Status: newStatus } : route
          ),
        }));
      },
      updateRouteName: (routeName: string, newName: string) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.Route === routeName ? { ...route, Route: newName } : route
          ),
        }));
      },
      updateRouteType: (routeName: string, newType: string) => {
        set((state) => ({
          routes: state.routes.map((route) =>
            route.Route === routeName
              ? {
                  ...route,
                  ["Route Type"]: newType,
                }
              : route
          ),
        }));
      },
      updateRouteInStops: (oldRoute: string, newRoute: string) => {
        set((state) => ({
          stops: state.stops.map((stop) =>
            stop.Route === oldRoute
              ? {
                  ...stop,
                  Route: newRoute,
                }
              : stop
          ),
        }));
      },
      updateTheme: (newTheme:"light"|"dark")=>{
        set({ themeValue: newTheme });
      },
      resetRoutes: () => {
        set({ routes: routsData });
      },
    }),
    {
      name: "my-zustand-store", // localStorage key
      // Persist everything(specify only according to need)
      partialize: (state) => ({
        routes: state.routes,
        // selectedRouts: state.selectedRouts,
        // selectedStops: state.selectedStops,
        themeValue: state.themeValue,
      }),
    }
  )
);

export default useMyStore;
