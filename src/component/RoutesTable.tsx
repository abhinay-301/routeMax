import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule, } from "ag-grid-community";
import useMyStore from "../store/route-store";
import StatusRadioEditor from "./StatusRadioEditor";
import RouteTypeEditor from "./RouteTypeEditor.tsx";
import "@salt-ds/ag-grid-theme/salt-ag-theme.css"


ModuleRegistry.registerModules([AllCommunityModule]);

const RouteTable = () => {
  const { routes, themeValue,updateTheme, updateSelectedRoutes, updateRouteName, updateRouteInStops } = useMyStore();
  const [routeData, setRouteData] = useState([]);
  const [routeColumn, setRouteColumn] = useState([]);

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
        if (key == "Route Type") {
          return {
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

  const onCellValueChanged = (event) => {
    const { colDef, oldValue, newValue, data } = event;

    if (colDef.field === "Route" && oldValue !== newValue) {
      updateRouteName(oldValue, newValue);
      updateRouteInStops(oldValue, newValue)
    }

    const updatedRow = { ...data };
    setRouteData((prev) =>
      prev.map((row) => (row === data ? updatedRow : row))
    );
    
  };
  const handleClick = () => {
    console.log("hi");
    updateTheme(themeValue==="dark" ?"light" :"dark");
    
  };
  return (
    <section>
      <button onClick={handleClick} className="px-4 py-2 bg-yellow-300 text-white rounded hover:bg-yellow-400">
        Change Theme
      </button>
        <h3 className="text-lg font-semibold mb-2">
          Routes
        </h3>
      <div className={`ag-theme-alpine-${themeValue} h-[300px]`}
        style={{ height: 500, width: "100%" }}
      >
        <AgGridReact
          theme="legacy"
          columnDefs={routeColumn}
          rowData={routeData}
          rowSelection="multiple"
          onSelectionChanged={onRouteSelection}
          stopEditingWhenCellsLoseFocus={true}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </section>
  );
};

export default RouteTable;
