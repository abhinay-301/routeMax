import MyGrid from "./component/RoutesTable";
import MapLayout from "./component/Map";
import StopsTable from "./component/stopsTable";

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Half: Routes Table + Map Side by Side */}
      <div className="flex flex-row h-[60%] border-b">
        <div className="w-1/2 border-r overflow-auto">
          <MyGrid />
        </div>
        <div className="w-1/2 overflow-hidden">
          <MapLayout />
        </div>
      </div>

      {/* Bottom Half: Stops Table Full Width */}
      <div className="h-[40%] overflow-auto">
        <StopsTable />
      </div>
    </div>
  );
}

export default App;
