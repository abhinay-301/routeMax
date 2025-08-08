// src/components/RouteTable.jsx
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import useMyStore from "../store/route-store";
import StatusRadioEditor from "./StatusRadioEditor";

ModuleRegistry.registerModules([AllCommunityModule]);

const RouteTable = () => {
  const { routes, updateSelectedRoutes } = useMyStore();
  const [routeData, setRouteData] = useState([]);
  const [routeColumn, setRouteColumn] = useState([]);

  function setDarkMode(enabled) {
    document.body.dataset.agThemeMode = enabled ? "dark-red" : "light-red";
  }
  setDarkMode(false);

  const theme = themeQuartz
    .withParams(
      {
        backgroundColor: "#FFE8E0",
        foregroundColor: "#361008CC",
        browserColorScheme: "light",
      },
      "light-red"
    )
    .withParams(
      {
        backgroundColor: "#201008",
        foregroundColor: "#FFFFFFCC",
        browserColorScheme: "dark",
      },
      "dark-red"
    );

  useEffect(() => {
    setRouteData(routes);

    if (routes.length > 0) {
      const keys = Object.keys(routes[0]);

      const cols = keys.map((key) => {
        if (key === "routeName") {
          return {
            headerName: "Route Name",
            field: "routeName",
            editable: true,
          };
        }

        if (key === "status") {
          return {
            headerName: "Status",
            field: "status",
            editable: true,
            cellEditor: StatusRadioEditor,
          };
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
            onChange={(e) => setDarkMode(e.target.checked)}
          />
        </label>
      </p>
      <div style={{ flex: 1 }}>
        <AgGridReact
          theme={theme}
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
