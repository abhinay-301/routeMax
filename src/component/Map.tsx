import { useEffect, useRef } from 'react';
import { Map, Marker, Route, setAPIKey } from '@trimblemaps/trimblemaps-js';
import useMyStore from '../store/route-store'; 


const StopsLatLng = (stops:[]) =>{
  let stopsInRoute = stops.map(stop => [
        parseFloat(stop.Longitude.replace(/'/g, "")), // Remove quotes and convert to float
        stop.Latitude
  ]);
  return stopsInRoute;
}

const MapLayout = () => {
  const mapRef = useRef(null);
  const {routes,stops,selectedRouts,selectedStops} = useMyStore();

  // console.log("selectedStops in store are: ",selectedStops);

  const mapInstance = useRef(null);
  useEffect(() => {
    setAPIKey(import.meta.env.VITE_API_URL);
    const myMap = new Map({
      container: mapRef.current,
      center: [-79.76622386770032, 33.883808061358835],
      zoom: 10,
    });
    mapInstance.current = myMap;
    const routeColor = ["red","green","yellow","blue","orange"] 
    const myRoutes = [];
    let stopsInRoute=[];
    for(let i=1;i<=selectedRouts.length;i++){
      let routeName = selectedRouts[i-1].Route;
      stopsInRoute = stops.filter(stop => routeName===stop.Route);

      stopsInRoute = StopsLatLng(stopsInRoute)

      // console.log("stopsInRoute",stopsInRoute);
      let myRoute = new Route({
        routeId:"myRoute"+i,    
        stops:stopsInRoute,
        routeColor:routeColor[(i-1)%5],
        isDraggable:false,
        showArrows:false,   
      })
      myRoutes.push(myRoute);

    }

    // marker for selected routes on routeTable
    StopsLatLng(selectedStops).forEach(stop => {
      let marker = new Marker({
        color: "black",
      }).setLngLat(stop).addTo(myMap);
    })

    myMap.on("load",function(){
      myMap.setDarkMode(true);
        // myRoute.addStopIcon('end', 'https://cdn-icons-png.flaticon.com/512/684/684908.png');
        for(let i=0;i<myRoutes.length;i++){
          if(stopsInRoute.length>1)
          {
            myRoutes[i].addTo(myMap);

          }
        }
    })
    mapInstance.current?.setDarkMode(true);
    return () => {
      myMap.remove();
    };
  }, [selectedRouts,selectedStops]);

  return (
    <div
      id="map"
      ref={mapRef}
      style={{ width: '100%', height: '100%' }} // 👈 MUST have dimensions
      
    />
  );
};

export default MapLayout;
