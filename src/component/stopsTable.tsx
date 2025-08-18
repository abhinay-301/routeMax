import { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import useMyStore from "../store/route-store";
import "../App.css"

// Register AG-Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

const StopsTable = () => {
  const { stops, selectedRouts, themeValue, updateSelectedStops } = useMyStore();

  const [filteredStops, setFilteredStops] = useState([]);
  const [selectedRouteName, setSelectedRouteName] = useState("");
  const [stopColumn, setStopColumn] = useState([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const gridRef = useRef<AgGridReact<any>>(null);
  const [quick, setQuick] = useState("");

  useEffect(() => {
    if (stops.length > 0) {
      const keys = Object.keys(stops[0]);
      const cols = keys.map((key) => ({
        field: key,
        // checkboxSelection: true,
        filter:true
      }));
      setStopColumn(cols);
    }
  }, [stops]);

  useEffect(() => {
    const selectedRouteNames = selectedRouts.map((row) => row.Route);
    setSelectedRouteName(selectedRouteNames.join(", "));

    const filtered = stops.filter((stop) =>
      selectedRouteNames.includes(stop.Route)
    );
    setFilteredStops(filtered);
  }, [selectedRouts, stops]);

  const onStopSelection = (e) => {
    const selected = e.api.getSelectedRows();
    updateSelectedStops(selected);
    // console.log("Selected stops:", selected);
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
        <div style={{ color: "green", fontWeight: 700, fontSize: 15, flex: 1 }}><u>Stops</u></div>

        <div className="flex items-center gap-0">
          <input
            title="Filter"
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="    🔍     Search…"
            className="h-8 px-2 rounded bg-gray-200 mx-3"
          />
          <button title="Refresh" className="h-8 px-2 border rounded hover:bg-gray-200">↻</button>
          <button title="Loading" className="h-8 px-2 border rounded hover:bg-gray-200">⋯</button>
          <button title="Light/Dark Mode" className="h-8 px-1 border rounded hover:bg-gray-200">
            👁
          </button>
          <button title="Fullscreen" className="h-8 px-2 border rounded hover:bg-gray-200" onClick={toggleFullscreen}>
            ⛶
          </button>
        </div>
      </div>
      <div className={`${themeValue==="dark"?"ag-theme-alpine-dark":"ag-theme-alpine"} grid-container`}>
        <AgGridReact
          theme="legacy"
          rowData={filteredStops}
          columnDefs={stopColumn}
          rowSelection="multiple"
          onSelectionChanged={onStopSelection}
          ref={gridRef}
          quickFilterText={quick}
        />
      </div>
      <div className="flex flex-row gap-1 p-2" style={{ fontSize: 15 }}>
        <h3 className="text-green-600 text-xs font-bold">54 Routes</h3>
        <h3 className=" text-xs">| 10 Missed Apts</h3>
        <h3 className=" text-xs">| 0 New</h3>
        <h3 className=" text-xs">| 0 Arriving Late</h3>
        </div>
    </div>
  );
};

export default StopsTable;
