import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  type?: 'online' | 'offline';
}

interface LiveLocationData {
  onlineMarker?: LocationPoint | null;
  offlineMarkers?: LocationPoint[];
  status?: 'online' | 'offline';
}

interface LiveLocationMapProps {
  locations: LiveLocationData;
}

const LiveLocationMap: React.FC<LiveLocationMapProps> = ({ locations }) => {
  const isOnline = locations.status === 'online' && locations.onlineMarker;
  const offlineMarkers = locations.offlineMarkers || [];

  // Check if we have any data to display
  const hasData = isOnline || offlineMarkers.length > 0;

  if (!hasData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        <p>No location data available</p>
      </div>
    );
  }

  // Use online marker if available, otherwise use the most recent offline marker
  const displayMarker = isOnline ? locations.onlineMarker : offlineMarkers[0];
  
  if (!displayMarker) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        <p>No location data available</p>
      </div>
    );
  }

  // Create custom icon for online (green)
  const createOnlineIcon = () => {
    const html = `
      <div style="
        background-color: #00C851;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 0 12px rgba(0, 200, 81, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 22px;
        font-weight: bold;
        animation: pulse 2s infinite;
      ">
        🟢
      </div>
    `;

    return L.divIcon({
      html,
      iconSize: [44, 44],
      className: 'custom-online-icon'
    });
  };

  // Create custom icon for offline (red)
  const createOfflineIcon = () => {
    const html = `
      <div style="
        background-color: #DC3545;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 8px rgba(220, 53, 69, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        font-weight: bold;
      ">
        🔴
      </div>
    `;

    return L.divIcon({
      html,
      iconSize: [36, 36],
      className: 'custom-offline-icon'
    });
  };

  const formattedTime = new Date(displayMarker.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Calculate bounds to show all markers
  const allLocations = [displayMarker, ...offlineMarkers].filter(loc => loc !== displayMarker || isOnline);
  const lats = allLocations.map(l => l.latitude);
  const lons = allLocations.map(l => l.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const bounds = [
    [minLat - 0.01, minLon - 0.01],
    [maxLat + 0.01, maxLon + 0.01]
  ] as [[number, number], [number, number]];

  const statusColor = isOnline ? '#00C851' : '#DC3545';
  const statusText = isOnline ? '🟢 Currently Online' : '🔴 Logged Out';
  const statusMessage = isOnline ? 'Active' : 'Offline';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Status Info Card */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: statusColor + '15',
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
              {statusText}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Last Update: {formattedTime}
            </div>
            {offlineMarkers.length > 0 && (
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                + {offlineMarkers.length} logout location{offlineMarkers.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: statusColor,
              animation: isOnline ? 'pulse 2s infinite' : 'none'
            }}
          />
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, overflow: 'hidden', borderRadius: '4px' }}>
        <MapContainer
          center={[displayMarker.latitude, displayMarker.longitude]}
          zoom={13}
          style={{ width: '100%', height: '100%', borderRadius: '4px' }}
          bounds={bounds}
          boundsOptions={{ padding: [60, 60] }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Online Marker (Green) - Current Location */}
          {isOnline && locations.onlineMarker && (
            <Marker position={[locations.onlineMarker.latitude, locations.onlineMarker.longitude]} icon={createOnlineIcon()}>
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <div style={{ marginBottom: '6px', fontWeight: '600', color: '#00C851' }}>
                    🟢 Current Location (Online)
                  </div>
                  <div>
                    <strong>Latitude:</strong> {locations.onlineMarker.latitude.toFixed(5)}
                  </div>
                  <div>
                    <strong>Longitude:</strong> {locations.onlineMarker.longitude.toFixed(5)}
                  </div>
                  <div>
                    <strong>Accuracy:</strong> ±{locations.onlineMarker.accuracy.toFixed(0)}m
                  </div>
                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #ddd' }}>
                    <strong>Time:</strong> {formattedTime}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Offline Markers (Red) - Logout Locations */}
          {offlineMarkers.map((marker, idx) => {
            const formattedOfflineTime = new Date(marker.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <Marker
                key={`offline-${idx}`}
                position={[marker.latitude, marker.longitude]}
                icon={createOfflineIcon()}
              >
                <Popup>
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ marginBottom: '6px', fontWeight: '600', color: '#DC3545' }}>
                      🔴 Logout Location #{offlineMarkers.length - idx}
                    </div>
                    <div>
                      <strong>Latitude:</strong> {marker.latitude.toFixed(5)}
                    </div>
                    <div>
                      <strong>Longitude:</strong> {marker.longitude.toFixed(5)}
                    </div>
                    <div>
                      <strong>Accuracy:</strong> ±{marker.accuracy.toFixed(0)}m
                    </div>
                    <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #ddd' }}>
                      <strong>Time:</strong> {formattedOfflineTime}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Location Details */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f8f9fa', marginTop: '12px', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Current Coordinates:</span> {displayMarker.latitude.toFixed(5)}, {displayMarker.longitude.toFixed(5)}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Accuracy:</span> ±{displayMarker.accuracy.toFixed(0)} meters
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Status:</span> {statusMessage}
        </div>
        {offlineMarkers.length > 0 && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
            <span style={{ fontWeight: '600', color: '#333' }}>Logout Events:</span> {offlineMarkers.length}
          </div>
        )}
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
