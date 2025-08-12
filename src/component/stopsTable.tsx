import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import useMyStore from "../store/route-store";

// Register AG-Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

const StopsTable = () => {
  const { stops, selectedRouts, updateSelectedStops } = useMyStore();

  const [filteredStops, setFilteredStops] = useState([]);
  const [selectedRouteName, setSelectedRouteName] = useState("");
  const [stopColumn, setStopColumn] = useState([]);

  useEffect(() => {
    if (stops.length > 0) {
      const keys = Object.keys(stops[0]);
      const cols = keys.map((key) => ({
        field: key,
        checkboxSelection: true,
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

  return (
    <div className="ag-theme-alpine h-[300px]">
      <h3 className="text-lg font-semibold mb-2">
        Stops for Routes: {selectedRouteName || "None selected"}
      </h3>
      <AgGridReact
        rowData={filteredStops}
        columnDefs={stopColumn}
        rowSelection="multiple"
        onSelectionChanged={onStopSelection}
      />
    </div>
  );
};

export default StopsTable;
