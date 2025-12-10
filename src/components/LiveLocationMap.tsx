import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface LiveLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface LiveLocationData {
  location: LiveLocation | null;
  status: 'online' | 'idle' | 'offline' | 'no_data';
  timeSinceUpdate: number;
  statusMessage: string;
}

interface LiveLocationMapProps {
  locations: LiveLocationData;
}

const LiveLocationMap: React.FC<LiveLocationMapProps> = ({ locations }) => {
  if (!locations.location) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        <p>No location data available</p>
      </div>
    );
  }

  const { location, status, timeSinceUpdate, statusMessage } = locations;

  // Create custom icon based on status
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#00C851'; // Green
      case 'idle':
        return '#FFC107'; // Orange/Yellow
      case 'offline':
        return '#DC3545'; // Red
      default:
        return '#999'; // Gray
    }
  };

  const statusColor = getStatusColor();

  // Create custom SVG icon
  const createStatusIcon = () => {
    const html = `
      <div style="
        background-color: ${statusColor};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 0 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        font-weight: bold;
      ">
        📍
      </div>
    `;

    return L.divIcon({
      html,
      iconSize: [40, 40],
      className: 'custom-status-icon'
    });
  };

  const formattedTime = new Date(location.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const bounds = [
    [location.latitude - 0.01, location.longitude - 0.01],
    [location.latitude + 0.01, location.longitude + 0.01]
  ] as [[number, number], [number, number]];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Status Info Card */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: statusColor + '15', // 15% opacity
          borderLeft: `4px solid ${statusColor}`,
          marginBottom: '12px',
          borderRadius: '4px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: statusColor,
                marginBottom: '4px'
              }}
            >
              {statusMessage}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Last Update: {timeSinceUpdate}m ago • {formattedTime}
            </div>
          </div>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: statusColor,
              animation: status === 'online' ? 'pulse 2s infinite' : 'none'
            }}
          />
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, overflow: 'hidden', borderRadius: '4px' }}>
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={15}
          style={{ width: '100%', height: '100%', borderRadius: '4px' }}
          bounds={bounds}
          boundsOptions={{ padding: [50, 50] }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[location.latitude, location.longitude]} icon={createStatusIcon()}>
            <Popup>
              <div style={{ fontSize: '12px' }}>
                <div style={{ marginBottom: '6px', fontWeight: '600' }}>Current Location</div>
                <div>
                  <strong>Latitude:</strong> {location.latitude.toFixed(5)}
                </div>
                <div>
                  <strong>Longitude:</strong> {location.longitude.toFixed(5)}
                </div>
                <div>
                  <strong>Accuracy:</strong> ±{location.accuracy.toFixed(0)}m
                </div>
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #ddd' }}>
                  <strong>Status:</strong> {statusMessage}
                </div>
                <div>
                  <strong>Last Update:</strong> {timeSinceUpdate}m ago
                </div>
                <div>
                  <strong>Time:</strong> {formattedTime}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Location Details */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f8f9fa', marginTop: '12px', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Coordinates:</span> {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Accuracy:</span> ±{location.accuracy.toFixed(0)} meters
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveLocationMap;
