
import { useStore } from "zustand"
import useMyStore from "../store/route-store"


const Theme = () => {
    const {theme} = useMyStore();
    const gridTheme = ["ag-theme-alpine","ag-theme-alpine-dark"];
  return (
     <div>
    <button onClick={() => setTheme(prev => prev === 'ag-theme-alpine' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine')}>
      Toggle Theme
    </button>

    <div className={theme} style={{ height: '500px', width: '100%' }}>
    </div>
  </div>
  )
}

export default Theme
