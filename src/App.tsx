import MyGrid from "./component/RoutesTable";
import MapLayout from "./component/Map";
import StopsTable from "./component/stopsTable";

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-200">
      {/* Top Half: Routes Table + Map Side by Side */}
      <div className="flex flex-row h-[60%] border-gray-200">
        <div className="w-1/2 border-gray-200 overflow-aut m-1">
          <MyGrid />
        </div>
        <div className="w-1/2 overflow-hidden border-gray-200 m-1">
          <MapLayout />
        </div>
      </div>

      {/* Bottom Half: Stops Table Full Width */}
      <div className="h-[40%] overflow-auto border-gray-200 mx-1 my-0.5">
        <StopsTable />
      </div>
    </div>
  );
}

export default App;
