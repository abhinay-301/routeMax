// src/components/MyGrid.js
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import useMyStore from "../store/route-store"

const MyGrid = () => {
  const {routes,updateSelectedRoutes} = useMyStore();
  const [routeData, setRouteData] = useState([]);
  const [routeColumn, setRouteColumn] = useState([]);

  useEffect(() => {
    setRouteData(routes);
    if (routes.length > 0) {
      const keys = Object.keys(routes[0]);
      const cols = keys.map(key => ({ field: key, checkboxSelection: true , }));
      console.log(cols);
      setRouteColumn(cols);
    }

  }, [])

  const onRouteSelection = (event) => {
    const selected = event.api.getSelectedRows(); // <-- this gives ALL selected
    updateSelectedRoutes(selected);// storing in zustand store
  };

  

  return (

      <div className="ag-theme-alpine" style={{ width: "100%", height: "100%" }}>
        <h3>Routes</h3>
        <AgGridReact
          rowData={routeData}
          columnDefs={routeColumn}
          rowSelection="multiple"

          onSelectionChanged={onRouteSelection}
        />
      </div>


  );
};

export default MyGrid;
