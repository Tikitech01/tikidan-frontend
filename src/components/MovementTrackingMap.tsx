import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from '@iconify/react';

interface LocationPoint {
  _id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  eventType: 'login' | 'logout' | 'tracking';
}

interface MovementTrackingMapProps {
  employeeId: string;
  date: string; // YYYY-MM-DD format
}

// Icon for start point (login)
const startIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icon for end point (logout)
const endIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icon for tracking points (intermediate)
const trackingIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [15, 31],
  iconAnchor: [7, 31],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MovementTrackingMap: React.FC<MovementTrackingMapProps> = ({ employeeId, date }) => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [center, setCenter] = useState<[number, number]>([20, 78]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalDuration: 0,
    trackingPoints: 0
  });

  useEffect(() => {
    fetchMovementData();
  }, [employeeId, date]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const fetchMovementData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Convert date to ISO format for API
      const apiDate = new Date(date).toISOString().split('T')[0];
      
      const response = await fetch(
        `http://localhost:5000/api/reports/employee/${employeeId}/movement?date=${apiDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Movement data:', data);
        
        if (data.success && data.data && data.data.locations) {
          const locationPoints = data.data.locations as LocationPoint[];
          setLocations(locationPoints);

          // Calculate statistics
          if (locationPoints.length > 0) {
            let totalDistance = 0;
            
            // Calculate total distance between consecutive points
            for (let i = 1; i < locationPoints.length; i++) {
              const prev = locationPoints[i - 1];
              const curr = locationPoints[i];
              const distance = calculateDistance(
                prev.latitude,
                prev.longitude,
                curr.latitude,
                curr.longitude
              );
              totalDistance += distance;
            }

            // Calculate duration
            const firstTime = new Date(locationPoints[0].timestamp).getTime();
            const lastTime = new Date(locationPoints[locationPoints.length - 1].timestamp).getTime();
            const durationMs = lastTime - firstTime;
            const durationHours = durationMs / (1000 * 60 * 60);

            setStats({
              totalDistance: parseFloat(totalDistance.toFixed(2)),
              totalDuration: parseFloat(durationHours.toFixed(2)),
              trackingPoints: locationPoints.length
            });

            // Set center to first location
            if (locationPoints.length > 0) {
              setCenter([locationPoints[0].latitude, locationPoints[0].longitude]);
            }
          }
        }
      } else {
        console.error('Failed to fetch movement data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching movement data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px',
        backgroundColor: '#f9fafb',
        borderRadius: '4px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Icon icon="mdi:loading" width="48" height="48" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading movement data...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '500px',
        backgroundColor: '#f9fafb',
        borderRadius: '4px',
        flexDirection: 'column',
        color: '#9ca3af'
      }}>
        <Icon icon="mdi:map-outline" width="48" height="48" style={{ marginBottom: '12px', opacity: 0.3 }} />
        <p>No movement data available for this date</p>
      </div>
    );
  }

  // Prepare path coordinates
  const pathCoordinates: [number, number][] = locations.map(loc => [loc.latitude, loc.longitude]);

  // Separate locations by type
  const startPoints = locations.filter(loc => loc.eventType === 'login');
  const endPoints = locations.filter(loc => loc.eventType === 'logout');
  const trackingPoints = locations.filter(loc => loc.eventType === 'tracking');

  return (
    <div>
      {/* Statistics Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #86efac'
        }}>
          <div style={{ fontSize: '12px', color: '#65a30d', marginBottom: '4px' }}>Total Distance</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#16a34a' }}>
            {stats.totalDistance} <span style={{ fontSize: '14px' }}>km</span>
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fde047'
        }}>
          <div style={{ fontSize: '12px', color: '#b45309', marginBottom: '4px' }}>Duration</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#f59e0b' }}>
            {stats.totalDuration} <span style={{ fontSize: '14px' }}>hrs</span>
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          border: '1px solid #7dd3fc'
        }}>
          <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px' }}>Tracking Points</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#0284c7' }}>
            {stats.trackingPoints}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ borderRadius: '4px', overflow: 'hidden', height: '500px' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Draw path */}
          {pathCoordinates.length > 1 && (
            <Polyline
              positions={pathCoordinates}
              color="#3b82f6"
              weight={3}
              opacity={0.7}
            />
          )}

          {/* Start points (Login) */}
          {startPoints.map((point) => (
            <Marker
              key={`start-${point._id}`}
              position={[point.latitude, point.longitude]}
              icon={startIcon}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: '#16a34a' }}>
                    🟢 Login Point
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <strong>Time:</strong> {new Date(point.timestamp).toLocaleTimeString()}<br />
                    <strong>Accuracy:</strong> ±{point.accuracy}m
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* End points (Logout) */}
          {endPoints.map((point) => (
            <Marker
              key={`end-${point._id}`}
              position={[point.latitude, point.longitude]}
              icon={endIcon}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: '#dc2626' }}>
                    🔴 Logout Point
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <strong>Time:</strong> {new Date(point.timestamp).toLocaleTimeString()}<br />
                    <strong>Accuracy:</strong> ±{point.accuracy}m
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Tracking points */}
          {trackingPoints.map((point) => (
            <Marker
              key={`tracking-${point._id}`}
              position={[point.latitude, point.longitude]}
              icon={trackingIcon}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: '#0284c7' }}>
                    🔵 Tracking Point
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <strong>Time:</strong> {new Date(point.timestamp).toLocaleTimeString()}<br />
                    <strong>Accuracy:</strong> ±{point.accuracy}m
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '4px',
        fontSize: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#16a34a'
          }} />
          <span>Login</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#0284c7'
          }} />
          <span>Tracking (5-min intervals)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#dc2626'
          }} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default MovementTrackingMap;
