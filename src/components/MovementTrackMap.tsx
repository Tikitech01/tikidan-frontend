import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

interface LocationPoint {
  _id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  distanceFromPrevious: number;
  timeFromPrevious: number;
}

interface MovementTrackMapProps {
  locations: LocationPoint[];
}

const MovementTrackMap: React.FC<MovementTrackMapProps> = ({ locations }) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);

  useEffect(() => {
    if (locations && locations.length > 0) {
      const firstLocation = locations[0];
      setMapCenter([firstLocation.latitude, firstLocation.longitude]);
    }
  }, [locations]);

  if (!locations || locations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        No movement data available
      </div>
    );
  }

  // Create polyline coordinates (connecting dots)
  const polylineCoordinates = locations.map(loc => [loc.latitude, loc.longitude] as [number, number]);

  // Custom icons for start, end, and middle points
  const startIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzRDQUY1MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkE8L3RleHQ+PC9zdmc+',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  const endIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iI2ZmNmI2YiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkI8L3RleHQ+PC9zdmc+',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  const middleIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI4IiBmaWxsPSIjMjE5NkYzIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });

  return (
    <MapContainer
      center={mapCenter}
      zoom={15}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Draw polyline connecting all points */}
      <Polyline
        positions={polylineCoordinates}
        color="#2196F3"
        weight={3}
        opacity={0.8}
        dashArray="5, 5"
      />

      {/* Render location markers */}
      {locations.map((location, index) => {
        const isStart = index === 0;
        const isEnd = index === locations.length - 1;
        const icon = isStart ? startIcon : isEnd ? endIcon : middleIcon;

        return (
          <Marker key={location._id} position={[location.latitude, location.longitude]} icon={icon}>
            <Popup>
              <div style={{ fontSize: '12px' }}>
                <strong>
                  {isStart ? 'Start' : isEnd ? 'End' : `Point ${index + 1}`}
                </strong>
                <br />
                Time: {new Date(location.timestamp).toLocaleTimeString()}
                <br />
                Lat: {location.latitude.toFixed(5)}
                <br />
                Lon: {location.longitude.toFixed(5)}
                {location.accuracy && (
                  <>
                    <br />
                    Accuracy: {location.accuracy.toFixed(1)}m
                  </>
                )}
                {location.distanceFromPrevious > 0 && (
                  <>
                    <br />
                    Distance: {location.distanceFromPrevious.toFixed(3)}km
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MovementTrackMap;
