import {create} from "zustand";
import routsData from "../data/Download routes.json";
import stopsData from "../data/Download stops.json";



const useMyStore = create((set)=>({
    routes:routsData,
    stops:stopsData,
    selectedRouts:[],
    selectedStops:[],
    updateSelectedRoutes: (newRoute: [])=>{
        set({selectedRouts: newRoute})
        console.log("store while updating",newRoute);
    },
    updateSelectedStops: (newStops : [])=>{
        set({selectedStops:newStops})
    }
    
}))

export default useMyStore;