import MyGrid from "./component/RoutesTable";
import MapLayout from "./component/Map";
function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  return (
    <div className="flex-auto ">
      <div className="h-1/2">
        <div className="p-4 m-2 container b">
          <MyGrid />
        </div>
      </div>
      <div>
        <MapLayout/>
      </div>
    </div>
  );
}

export default App;
