import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      if (onPick) onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// نقشه‌ی OpenStreetMap با یک یا چند نشانه
export default function CityMap({ center, markers = [], selected, onPick, zoom = 13, height = 280 }) {
  return (
    <div className="map-frame" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickCapture onPick={onPick} />
        {markers.map((m) => (
          <CircleMarker
            key={m.id}
            center={m.position}
            radius={9}
            pathOptions={{ color: '#007452', fillColor: '#008760', fillOpacity: 0.85, weight: 3 }}
          >
            {m.label && <Popup>{m.label}</Popup>}
          </CircleMarker>
        ))}
        {selected && (
          <CircleMarker
            center={selected}
            radius={12}
            pathOptions={{ color: '#26343e', fillColor: '#ffffff', fillOpacity: 1, weight: 3 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
