export interface Route {
  Route: string;
  Status: string;
  "Route Type": string;
  "Ttl Stops": number;
  "Ttl Bills": number;
  PSE: number;
  Weight: number;
  LG: number;
  APT: number;
  "Start Time": string;
  Comments: string | null;
}

export interface Stop {
  Seq: number;
  Route: string;
  Customer: string;
  Latitude: number;
  Longitude: string; 
  Address: string | null;
  City: string| null;
  State: string| null;
  Zip: number| null;
  Bills: number| null;
  HU: number| null;
  PSE: number| null;
  Weight: number| null;
  "Delivery Window": string| null;
  Status: string| null;
  ETA: string| null;
  ETD: string| null;
  "Stop Time (Mins)": number| null;
}


export interface MyStore {
  routes: Route[];
  stops: Stop[];
  selectedRouts: Route[];
  selectedStops: Stop[];
  theme: "light" | "dark";

  updateSelectedRoutes: (newRoute: Route[]) => void;
  updateSelectedStops: (newStops: Stop[]) => void;
  updateTheme: (newTheme: "light" | "dark") => void;
  updateRoutesStatus: (routeName: string, newStatus: string) => void;
  updateRouteName: (routeName: string, newName: string) => void;
  updateRouteType: (routeName: string, newType: string) => void;
  updateRouteInStops(oldRoute:string,newRoute:string) => void;
}
