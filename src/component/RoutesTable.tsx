// src/components/MyGrid.js
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import useMyStore from "../store/route-store"

const MyGrid = () => {
  const {routes,stops,updateSelectedRoutes,updateSelectedStops} = useMyStore();
  const [routeData, setRouteData] = useState([]);
  const [routeColumn, setRouteColumn] = useState([]);
  const [stopData, setStopData] = useState([]);
  const [stopColumn, setStopColumn] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState(null);
  const [filteredStops, setFilteredStops] = useState([]);

  useEffect(() => {
    setRouteData(routes);
    if (routes.length > 0) {
      const keys = Object.keys(routes[0]);
      const cols = keys.map(key => ({ field: key, checkboxSelection: true , }));
      console.log(cols);
      setRouteColumn(cols);
    }
    setStopData(stops);
    if (stops.length > 0) {
      const keys = Object.keys(stops[0]);
      const cols = keys.map(key => ({ field: key, checkboxSelection: true , }));
      console.log(cols);
      setStopColumn(cols);
    }

  }, [])

  const onRouteSelection = (event) => {
    const selected = event.api.getSelectedRows(); // <-- this gives ALL selected
    updateSelectedRoutes(selected);// storing in zustand store
    const selectedRouteNames = selected.map(row => row.Route);
    setSelectedRoutes(selectedRouteNames.join(', '));
    // console.log("selectedRouteNames:",selectedRouteNames);
    const filtered = stopData.filter(stop => selectedRouteNames.includes(stop.Route));
    setFilteredStops(filtered);
  };
  const onStopSelection = (e) =>{
    const selected = e.api.getSelectedRows();
    updateSelectedStops(selected);
    console.log("selected stops in grid are: ",selected);
  }


  return (
    <div className="flex gap-2 justify-items-end">
      <div className="ag-theme-alpine flex-1/2" style={{ width: 500, height: 400 }}>
        <h3>Routes</h3>
        <AgGridReact
          rowData={routeData}
          columnDefs={routeColumn}
          rowSelection="multiple"

          onSelectionChanged={onRouteSelection}
        />
      </div>

      <div className="ag-theme-alpine flex-1/2 ">
        <h3>Stops for Routes: {selectedRoutes || 'None selected'}</h3>
        <AgGridReact
          rowData={filteredStops}
          columnDefs={stopColumn}
          rowSelection="multiple"
          onSelectionChanged={onStopSelection}
        />
      </div>
    </div>
  );
};

export default MyGrid;
