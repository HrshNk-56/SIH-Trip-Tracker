import { useEffect, useRef } from 'react';

interface Marker { lat: number; lon: number; label?: string }
interface LeafletMapProps {
  center: { lat: number; lon: number };
  markers: Marker[];
  height?: number;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ center, markers, height = 220 }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    const ensureLeaflet = async () => {
      if ((window as any).L) return;
      // inject CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      await new Promise((res) => { link.onload = () => res(null); });
      // inject JS
      await new Promise((res) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.async = true;
        s.onload = () => res(null);
        document.body.appendChild(s);
      });
    };

    (async () => {
      await ensureLeaflet();
      const L = (window as any).L;
      if (!mapRef.current) return;
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
      const map = L.map(mapRef.current).setView([center.lat, center.lon], 13);
      instanceRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      markers.forEach(m => {
        L.marker([m.lat, m.lon]).addTo(map).bindPopup(m.label || '');
      });
    })();

    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; } };
  }, [center.lat, center.lon, JSON.stringify(markers)]);

  return <div ref={mapRef} style={{ height, position: 'relative', zIndex: 0, overflow: 'hidden' }} className="rounded-xl border border-border"/>;
};

export default LeafletMap;