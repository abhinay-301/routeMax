import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import useMyStore from "../store/route-store";
import StatusRadioEditor from "./StatusRadioEditor";
import RouteTypeEditor from "./RouteTypeEditor.tsx";

ModuleRegistry.registerModules([AllCommunityModule]);

const RouteTable = () => {
  const { routes, updateSelectedRoutes } = useMyStore();
  const [routeData, setRouteData] = useState([]);
  const [routeColumn, setRouteColumn] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setRouteData(routes);

    if (routes.length > 0) {
      const keys = Object.keys(routes[0]);

      const cols = keys.map((key) => {
        if (key === "Route") {
          return {
            headerName: "Route Name",
            field: "Route",
            editable: true,
          };
        }

        if (key === "Status") {
          return {
            headerName: "Status",
            field: "Status",
            editable: true,
            cellEditor: StatusRadioEditor,
          };
        }
        if(key == "Route Type"){
          return{
            headerName: "Route Type",
            field: "Route Type",
            editable: true,
            cellEditor: RouteTypeEditor,
          }
        }

        return { field: key };
      });

      // Add checkbox selection on first column
      if (cols.length > 0) {
        cols[0].checkboxSelection = true;
      }

      setRouteColumn(cols);
    }
  }, [routes]);

  const onRouteSelection = (event) => {
    const selected = event.api.getSelectedRows();
    updateSelectedRoutes(selected);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <p style={{ flex: 0 }}>
        <label>
          Dark mode:{" "}
          <input
            type="checkbox"
            onChange={(e) => setIsDarkMode(e.target.checked)}
          />
        </label>
      </p>
      <div
        style={{ flex: 1 }}
        className={isDarkMode ? "ag-theme-quartz-dark" : "ag-theme-quartz"}
      >
        <AgGridReact
          columnDefs={routeColumn}
          rowData={routeData}
          rowSelection="multiple"
          onSelectionChanged={onRouteSelection}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </div>
  );
};

export default RouteTable;
