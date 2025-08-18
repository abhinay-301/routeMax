import { useEffect, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import useMyStore from "../store/route-store";
import StatusRadioEditor from "./StatusRadioEditor";
import RouteTypeEditor from "./RouteTypeEditor.tsx";
import "@salt-ds/ag-grid-theme/salt-ag-theme.css";
import "../App.css";

ModuleRegistry.registerModules([AllCommunityModule]);

type BulkScope = "selected" | "filtered" | "all";
type NameMode = "set" | "append" | "prepend" | "clear";
type StatusValue = "Locked" | "Unlocked";
type RouteTypeValue = "City" | "Trap";

const RouteTable = () => {
  const {
    routes,
    themeValue,
    updateTheme,
    updateSelectedRoutes,
    updateRouteName,
    updateRouteInStops,
  } = useMyStore();

  const [routeData, setRouteData] = useState<any[]>([]);
  const [routeColumn, setRouteColumn] = useState<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<AgGridReact<any>>(null);
  const [quick, setQuick] = useState("");

  // ---- Bulk Edit State ----
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkScope, setBulkScope] = useState<BulkScope>("selected");

  const [bulkNameEnabled, setBulkNameEnabled] = useState(false);
  const [bulkStatusEnabled, setBulkStatusEnabled] = useState(false);
  const [bulkTypeEnabled, setBulkTypeEnabled] = useState(false);

  const [nameMode, setNameMode] = useState<NameMode>("set");
  const [nameText, setNameText] = useState("");

  const [statusValue, setStatusValue] = useState<StatusValue>("Unlocked");
  const [typeValue, setTypeValue] = useState<RouteTypeValue>("City");

  const [undoSnapshot, setUndoSnapshot] = useState<any[] | null>(null);

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
            filter: true,
          };
        }

        if (key === "Status") {
          return {
            headerName: "Status",
            field: "Status",
            editable: true,
            cellEditor: StatusRadioEditor,
            filter: true,
          };
        }

        if (key === "Route Type") {
          return {
            headerName: "Route Type",
            field: "Route Type",
            editable: true,
            cellEditor: RouteTypeEditor,
            filter: true,
          };
        }

        return { field: key, filter: true };
      });

      // Add checkbox selection on first column
      // if (cols.length > 0) {
      //   cols[0].checkboxSelection = true;
      // }

      setRouteColumn(cols);
    }
  }, [routes]);

  const onRouteSelection = (event: any) => {
    const selected = event.api.getSelectedRows();
    updateSelectedRoutes(selected);
  };

  const onCellValueChanged = (event: any) => {
    const { colDef, oldValue, newValue, data } = event;

    if (colDef.field === "Route" && oldValue !== newValue) {
      updateRouteName(oldValue, newValue);
      updateRouteInStops(oldValue, newValue);
    }

    const updatedRow = { ...data };
    setRouteData((prev) => prev.map((row) => (row === data ? updatedRow : row)));
  };

  const handleClick = () => {
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

  // ---------- Bulk Edit helpers ----------
  const getTargetRows = (scope: BulkScope) => {
    const api = gridRef.current?.api;
    if (!api) return [];
    if (scope === "selected") {
      return api.getSelectedRows() ?? [];
    }
    if (scope === "filtered") {
      const rows: any[] = [];
      api.forEachNodeAfterFilterAndSort((n) => {
        if (n.data) rows.push(n.data);
      });
      return rows;
    }
    // "all"
    const all: any[] = [];
    api.forEachNode((n) => {
      if (n.data) all.push(n.data);
    });
    return all;
  };

  const transformName = (current: string, mode: NameMode, text: string) => {
    if (mode === "set") return text;
    if (mode === "append") return `${current ?? ""}${text}`;
    if (mode === "prepend") return `${text}${current ?? ""}`;
    if (mode === "clear") return "";
    return current;
  };

  const validateBulkInputs = () => {
    if (bulkNameEnabled) {
      if (nameMode === "set" && !nameText.trim()) {
        alert("Route Name cannot be empty when using Set.");
        return false;
      }
    }
    if (bulkStatusEnabled && !["Locked", "Unlocked"].includes(statusValue)) {
      alert("Invalid Status.");
      return false;
    }
    if (bulkTypeEnabled && !["City", "Trap"].includes(typeValue)) {
      alert("Invalid Route Type.");
      return false;
    }
    if (!(bulkNameEnabled || bulkStatusEnabled || bulkTypeEnabled)) {
      alert("Select at least one field to edit.");
      return false;
    }
    return true;
  };

  const applyBulkEdit = () => {
    const targets = getTargetRows(bulkScope);
    if (!targets.length) {
      alert("No rows in scope.");
      return;
    }
    if (!validateBulkInputs()) return;

    // "Route" -> unique identifier.
    const idKey = "Route";
    const targetIds = new Set(targets.map((r: any) => String(r[idKey])));

    // Keep a snapshot for Undo
    setUndoSnapshot(routeData);

    // For coordinating name change side effects in store
    const renamePairs: Array<{ oldName: string; newName: string }> = [];

    // Build new data in one pass
    const newData = routeData.map((row) => {
      const rowId = String(row[idKey]);
      if (!targetIds.has(rowId)) return row;

      const next = { ...row };

      if (bulkNameEnabled) {
        const oldName = String(next["Route"] ?? "");
        const newName = transformName(oldName, nameMode, nameText);
        if (oldName !== newName) {
          next["Route"] = newName;
          renamePairs.push({ oldName, newName });
        }
      }

      if (bulkStatusEnabled) {
        next["Status"] = statusValue;
      }

      if (bulkTypeEnabled) {
        next["Route Type"] = typeValue;
      }

      return next;
    });

    //uniqueness check for Route after changes
    /*
    const names = new Set<string>();
    for (const r of newData) {
      const n = String(r["Route"] ?? "");
      if (names.has(n)) {
        alert(`Duplicate Route name detected: "${n}". Aborting.`);
        return;
      }
      names.add(n);
    }
    */

    // Commit to UI in one batch
    setRouteData(newData);

    // Keep store consistent for renames & stops
    renamePairs.forEach(({ oldName, newName }) => {
      console.log(oldName+"  -> "+newName)
      if (oldName !== newName) {
        updateRouteName(oldName, newName);
        updateRouteInStops(oldName, newName);
      }
    });

    setBulkOpen(false);
  };

  const undoBulk = () => {
    if (!undoSnapshot) return;
    //only restores the grid state
    setRouteData(undoSnapshot);
    setUndoSnapshot(null);
  };

  return (
    <div
      className={`${themeValue === "dark" ? "bg-gray-300" : "bg-amber-50"}`}
      ref={wrapperRef}
      style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "10px 12px",
          borderBottom: "1px solid #e6e6e6",
        }}
      >
        <div style={{ color: "green", fontWeight: 700, fontSize: 15, flex: 1 }}>Routes</div>

        <div className="flex items-center gap-0">
          <input
            title="Filter"
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="    🔍     Search…"
            className="h-8 px-2  rounded bg-gray-200 mx-3"
          />
          <button
            title="Refresh"
            className="h-8 px-2 border rounded hover:bg-gray-200"
            onClick={undoBulk}

          >↻</button>
          <button title="Loading" className="h-8 px-2 border rounded hover:bg-gray-200">⋯</button>

          {/* Bulk Edit button */}
          <button
            title="Bulk Edit"
            className="h-8 px-2 border rounded hover:bg-gray-200 mr-2"
            onClick={() => setBulkOpen(true)}
          >
            ✎
          </button>

          <button title="Light/Dark Mode" onClick={handleClick} className="h-8 px-1 border rounded hover:bg-gray-200">
            👁
          </button>
          <button title="Fullscreen" className="h-8 px-2 border rounded hover:bg-gray-200" onClick={toggleFullscreen}>
            ⛶
          </button>
        </div>
      </div>

      <div
        className={`${themeValue === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"} grid-container`}
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

      <div className="flex flex-row items-center gap-1 p-2" style={{ fontSize: 15 }}>
        <h3 className="text-green-600 text-xs font-bold">5 Routes</h3>
        <h3 className=" text-xs">| 2 Missed Apts Routes</h3>
        <h3 className=" text-xs">| 0 New</h3>
        <h3 className=" text-xs">| 0 Arriving Late</h3>
        <h3 className=" text-xs">| 0 Trap Routes</h3>
        <h3 className=" text-xs">| 5 Open Routes</h3>
      </div>

      {/* ---- Bulk Edit Modal ---- */}
      {bulkOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div
            className={`${themeValue === "dark" ? "bg-gray-800 text-white" : "bg-white"
              } w-[560px] rounded-lg shadow p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Bulk Edit — Routes</h3>
              <button className="px-2 py-1 border rounded" onClick={() => setBulkOpen(false)}>
                ✕
              </button>
            </div>

            {/* Scope */}
            <div className="mb-3">
              <div className="font-medium mb-1">Apply to</div>
              <div className="flex gap-3 text-sm">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={bulkScope === "selected"}
                    onChange={() => setBulkScope("selected")}
                  />
                  Selected rows
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={bulkScope === "filtered"}
                    onChange={() => setBulkScope("filtered")}
                  />
                  All filtered rows
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" checked={bulkScope === "all"} onChange={() => setBulkScope("all")} />
                  All rows
                </label>
              </div>
            </div>

            {/* Route Name */}
            <div className="mb-3 border rounded p-2">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={bulkNameEnabled}
                  onChange={(e) => setBulkNameEnabled(e.target.checked)}
                />
                <span className="font-medium">Route Name</span>
              </label>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="col-span-3 flex flex-wrap gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      disabled={!bulkNameEnabled}
                      checked={nameMode === "set"}
                      onChange={() => setNameMode("set")}
                    />
                    Set
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      disabled={!bulkNameEnabled}
                      checked={nameMode === "clear"}
                      onChange={() => setNameMode("clear")}
                    />
                    Clear
                  </label>
                </div>

                <input
                  disabled={!bulkNameEnabled || nameMode === "clear"}
                  value={nameText}
                  onChange={(e) => setNameText(e.target.value)}
                  placeholder={nameMode === "set" ? "New name" : "Text"}
                  className="col-span-3 h-8 px-2 rounded bg-gray-200 text-black mt-2"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mb-3 border rounded p-2">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={bulkStatusEnabled}
                  onChange={(e) => setBulkStatusEnabled(e.target.checked)}
                />
                <span className="font-medium">Status</span>
              </label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    disabled={!bulkStatusEnabled}
                    checked={statusValue === "Locked"}
                    onChange={() => setStatusValue("Locked")}
                  />
                  Locked
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    disabled={!bulkStatusEnabled}
                    checked={statusValue === "Unlocked"}
                    onChange={() => setStatusValue("Unlocked")}
                  />
                  Unlocked
                </label>
              </div>
            </div>

            {/* Route Type */}
            <div className="mb-4 border rounded p-2">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={bulkTypeEnabled}
                  onChange={(e) => setBulkTypeEnabled(e.target.checked)}
                />
                <span className="font-medium">Route Type</span>
              </label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    disabled={!bulkTypeEnabled}
                    checked={typeValue === "City"}
                    onChange={() => setTypeValue("City")}
                  />
                  City
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    disabled={!bulkTypeEnabled}
                    checked={typeValue === "Trap"}
                    onChange={() => setTypeValue("Trap")}
                  />
                  Trap
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button className="h-8 px-3 border rounded hover:bg-gray-200" onClick={() => setBulkOpen(false)}>
                Cancel
              </button>
              <button
                className="h-8 px-3 border rounded bg-green-600 text-white disabled:opacity-50"
                onClick={applyBulkEdit}
                disabled={!(bulkNameEnabled || bulkStatusEnabled || bulkTypeEnabled)}
              >
                Apply to scope
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteTable;
