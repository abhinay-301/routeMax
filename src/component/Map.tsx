import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Map,
  Marker,
  Route,
  setAPIKey,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
  Common
} from '@trimblemaps/trimblemaps-js';
import useMyStore from '../store/route-store';

type Stop = {
  Latitude: number;
  Longitude: string; // may include single-quotes per your data
  Route?: string;
};



const toLngLat = (stops: Stop[]) =>
  stops.map(s => [parseFloat(String(s.Longitude).replace(/'/g, '')), s.Latitude] as [number, number]);

const haversineKm = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

const MapLayout = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  Common.Style.ACCESSIBLE_LIGHT

  const { routes, themeValue ,stops, selectedRouts, selectedStops,updateSelectedRoutes } = useMyStore();

  // ---- UI state (header) ----
  const [autoZoomDisabled, setAutoZoomDisabled] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const measuringPointsRef = useRef<[number, number][]>([]);
  const measuringRouteRef = useRef<any | null>(null);
  const tempGraphicsRef = useRef<{ routes: any[]; markers: any[] }>({ routes: [], markers: [] });
  const [measureDistanceKm, setMeasureDistanceKm] = useState<number>(0);

  // Precompute selected routes' stops (for drawing + bounds)
  const routesStopsLngLat = useMemo(() => {
    const list: [number, number][][] = [];
    for (let i = 0; i < selectedRouts.length; i++) {
      const rName = (selectedRouts[i] as any).Route;
      const s = (stops as Stop[]).filter(st => st.Route === rName);
      list.push(toLngLat(s));
    }
    return list;
  }, [selectedRouts, stops]);

  // Selected table stops -> markers
  const selectedStopsLngLat = useMemo(
    () => toLngLat(selectedStops as Stop[]),
    [selectedStops]
  );

  useEffect(() => {
    setAPIKey(import.meta.env.VITE_API_URL);

    const myMap = new Map({
      container: mapRef.current!,
      center: [-79.76622386770032, 33.883808061358835],
      zoom: 10,
    });

  

    mapInstance.current = myMap;

    // ---- Map controls (right stack like screenshot) ----
    myMap.addControl(new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    }), 'top-right');

    myMap.addControl(new FullscreenControl(), 'top-right');

    myMap.addControl(new NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    }), 'bottom-right');

    myMap.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');

    // ---- Load & draw routes/markers ----
    const routeColors = ['#cc0000', '#007b5e', '#c79a00', '#0061ff', '#ff6a00'];
    const builtRoutes: any[] = [];

    myMap.on('load', () => {
      // Draw selected routes
      routesStopsLngLat.forEach((stopsLL, idx) => {
        if (stopsLL.length > 1) {
          const r = new Route({
            routeId: `route-${idx + 1}`,
            stops: stopsLL,
            routeColor: routeColors[idx % routeColors.length],
            isDraggable: false,
            showArrows: false,
          });
          r.addTo(myMap);
          builtRoutes.push(r);
        }
      });

      // Markers for selected stops in table
      selectedStopsLngLat.forEach(ll => {
        const m = new Marker({ color: 'gray' }).setLngLat(ll).addTo(myMap);
        tempGraphicsRef.current.markers.push(m);
      });

      // Auto fit to everything (unless disabled)
      if (!autoZoomDisabled) {
        const all: [number, number][] = [
          ...routesStopsLngLat.flat(),
          ...selectedStopsLngLat,
        ];
        if (all.length) {
          const lons = all.map(p => p[0]);
          const lats = all.map(p => p[1]);
          const bounds: [[number, number], [number, number]] = [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)],
          ];
          // Add a little padding
          myMap.fitBounds(bounds, { padding: 40, duration: 500 });
        }
      }
    });

    // Keep reference so we can clear on unmount
    tempGraphicsRef.current.routes.push(...builtRoutes);

    // ---- Measure tool interactions ----
    const onMapClick = (e: any) => {
      if (!isMeasuring) return;
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      measuringPointsRef.current.push(pt);

      // Create or update a temporary route line
      if (!measuringRouteRef.current) {
        if (measuringPointsRef.current.length >= 2) {
          measuringRouteRef.current = new Route({
            routeId: 'measure-route',
            stops: measuringPointsRef.current,
            routeColor: '#444444',
            isDraggable: false,
            showArrows: false,
          });
          measuringRouteRef.current.addTo(myMap);
          tempGraphicsRef.current.routes.push(measuringRouteRef.current);
        }
      } else {
        measuringRouteRef.current.setStops(measuringPointsRef.current);
      }

      // Update running distance
      let km = 0;
      const pts = measuringPointsRef.current;
      for (let i = 1; i < pts.length; i++) km += haversineKm(pts[i - 1], pts[i]);
      setMeasureDistanceKm(km);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMeasuring) {
        // Finish measuring
        setIsMeasuring(false);
      }
    };

    myMap.on('click', onMapClick);
    window.addEventListener('keydown', onKeyDown);
          // myMap.setDarkMode(darkMode);
      if(themeValue ==="dark"){
        myMap.setStyle(Common.Style.ACCESSIBLE_DARK);
        myMap.setDarkMode(true);
      }else{
        myMap.setStyle(Common.Style.ACCESSIBLE_LIGHT);
        myMap.setDarkMode(false);
      }

    return () => {
      // Cleanup everything
      window.removeEventListener('keydown', onKeyDown);
      myMap.off('click', onMapClick);

      // remove temps (markers + routes)
      tempGraphicsRef.current.markers.forEach(m => m.remove());
      tempGraphicsRef.current.routes.forEach(r => r.remove());
      tempGraphicsRef.current = { routes: [], markers: [] };

      myMap.remove();
    };
  // Intentionally include flags that change drawing/fit; controls don't need reruns
  }, [routesStopsLngLat, selectedStopsLngLat, autoZoomDisabled, themeValue ,darkMode, isMeasuring]);

  // ---- Header actions ----
  const toggleBasemap = () => {
    setDarkMode(prev => {
      const next = !prev;
      mapInstance.current?.setDarkMode(next);
      mapInstance.current.setStyle(Common.Style.ACCESSIBLE_DARK);
      return next;
    });
  };

  const startStopMeasure = () => {
    setIsMeasuring(prev => {
      const next = !prev;
      if (!next) {
        // stopping -> keep the graphic but stop adding points
      } else {
        // starting fresh
        measuringPointsRef.current = [];
        setMeasureDistanceKm(0);
        // If an old measure line exists, remove it
        if (measuringRouteRef.current) {
          try { measuringRouteRef.current.remove(); } catch {}
          measuringRouteRef.current = null;
        }
      }
      return next;
    });
  };

  const clearOverlays = () => {
    // Remove measure line
    if (measuringRouteRef.current) {
      try { measuringRouteRef.current.remove(); } catch {}
      measuringRouteRef.current = null;
    }
    measuringPointsRef.current = [];
    setMeasureDistanceKm(0);

    // Remove temp markers/routes created elsewhere (if any)
    tempGraphicsRef.current.markers.forEach(m => m.remove());
    updateSelectedRoutes([]);
    tempGraphicsRef.current.routes.forEach(r => {
      if (r?.routeId === 'measure-route') return; // already removed
      try { r.remove(); } catch {}
    });
    tempGraphicsRef.current = { routes: [], markers: [] };
  };

  const toggleFullscreen = async () => {
    const el = wrapperRef.current!;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  const exportImage = () => {
    const canvas = mapInstance.current?.getCanvas?.();
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.png';
    a.click();
  };

  return (
    <div className={`${themeValue==="dark"?"bg-gray-300":"bg-amber-50"}`} ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Header Toolbar */}
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
        <div style={{color:"green", fontWeight: 700, fontSize: 15, flex: 1 }}>Routes Map</div>

        {/* Disable Auto Zoom */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 1 }} className="h-8 px-2 border rounded hover:bg-gray-200">
          <span style={{ color: '#555', fontSize:10 }}>Disable Auto Zoom</span>
          <input
            type="checkbox"
            checked={autoZoomDisabled}
            onChange={e => setAutoZoomDisabled(e.target.checked)}
          />
        </label>

        {/* Basemap */}
        <button title="Basemap (Light/Dark)"  className="h-8 px-2 border rounded hover:bg-gray-200">
          🗺️
        </button>

        {/* Measure */}
        <button
          title={isMeasuring ? 'Stop Measure (ESC)' : 'Start Measure'}
          onClick={startStopMeasure}
          className="h-8 px-2 border rounded hover:bg-gray-200"
        >
          📏
        </button>
        {isMeasuring || measureDistanceKm > 0 ? (
          <span style={{ fontSize: 12, color: '#666' }}>
            {isMeasuring ? 'Measuring… ' : 'Measured: '}
            {measureDistanceKm.toFixed(2)} km
          </span>
        ) : null}

        {/* Clear */}
        <button title="Clear Overlays" onClick={clearOverlays} className="h-8 px-2 border rounded hover:bg-gray-200">
          🗑️
        </button>

        {/* Fullscreen */}
        <button title="Fullscreen" onClick={toggleFullscreen} className="h-8 px-2 border rounded hover:bg-gray-200">
          ⛶
        </button>

        {/* Export */}
        <button title="Export PNG" onClick={exportImage} className="h-8 px-2 border rounded hover:bg-gray-200">
          ⤓
        </button>
      </div>

      {/* Map container */}
      <div
        id="map"
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MapLayout;
