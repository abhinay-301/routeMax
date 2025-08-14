import { useEffect, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule, } from "ag-grid-community";
import useMyStore from "../store/route-store";
import StatusRadioEditor from "./StatusRadioEditor";
import RouteTypeEditor from "./RouteTypeEditor.tsx";
import "@salt-ds/ag-grid-theme/salt-ag-theme.css"
import "../App.css"


ModuleRegistry.registerModules([AllCommunityModule]);

const RouteTable = () => {
  const { routes, themeValue, updateTheme, updateSelectedRoutes, updateRouteName, updateRouteInStops } = useMyStore();
  const [routeData, setRouteData] = useState([]);
  const [routeColumn, setRouteColumn] = useState([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const gridRef = useRef<AgGridReact<any>>(null);
  const [quick, setQuick] = useState("");

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
            filter: true
          };
        }

        if (key === "Status") {
          return {
            headerName: "Status",
            field: "Status",
            editable: true,
            cellEditor: StatusRadioEditor,
            filter: true
          };
        }
        if (key == "Route Type") {
          return {
            headerName: "Route Type",
            field: "Route Type",
            editable: true,
            cellEditor: RouteTypeEditor,
            filter: true
          }
        }

        return { field: key,filter:true };
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
    updateTheme(themeValue === "dark" ? "light" : "dark");

  };

  const toggleFullscreen = async () => {
    const el = wrapperRef.current!;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  return (
    <div 
    className={`${themeValue==="dark"?"bg-gray-300":"bg-amber-50"}`}
    ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '10px 12px',
          borderBottom: '1px solid #e6e6e6',
          // background: '#ffff',
        }}
      >
        <div style={{color:"green", fontWeight: 700, fontSize: 15, flex: 1 }}>Routes</div>

        <div className="flex items-center gap-0">
          <input
            title="Filter"
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="    🔍     Search…"
            className="h-8 px-2  rounded bg-gray-200 mx-3"
          />
          <button title="Refresh" className="h-8 px-2 border rounded hover:bg-gray-200">↻</button>
          <button title="Loading" className="h-8 px-2 border rounded hover:bg-gray-200">⋯</button>
          <button title="Light/Dark Mode" onClick={handleClick} className="h-8 px-1 border rounded hover:bg-gray-200">
           👁
          </button>
          <button title="Fullscreen" className="h-8 px-2 border rounded hover:bg-gray-200" onClick={toggleFullscreen}>
          ⛶
        </button>
        </div>
      </div>
      <div className={`${themeValue==="dark"?"ag-theme-alpine-dark":"ag-theme-alpine"} grid-container`}
        style={{ height: "100%", width: "100%" }}
      >
        <AgGridReact
          theme="legacy"
          columnDefs={routeColumn}
          rowData={routeData}
          rowSelection="multiple"
          onSelectionChanged={onRouteSelection}
          stopEditingWhenCellsLoseFocus={true}
          onCellValueChanged={onCellValueChanged}
          ref={gridRef}
          quickFilterText={quick}
        />
      </div>
      <div className="flex flex-row gap-1 p-2" style={{ fontSize: 15 }}>
        <h3 className="text-green-600 text-xs font-bold">5 Routes</h3>
        <h3 className=" text-xs">| 2 Missed Apts Routes</h3>
        <h3 className=" text-xs">| 0 New</h3>
        <h3 className=" text-xs">| 0 Arriving Late</h3>
        <h3 className=" text-xs">| 0 Trap Routes</h3>
        <h3 className=" text-xs">| 5 Open Routes</h3>
        </div>
    </div>
  );
};

export default RouteTable;
