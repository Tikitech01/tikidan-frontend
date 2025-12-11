import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from '@iconify/react';

interface MeetingLocation {
  _id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  meetingCount: number;
}

interface MeetingLocationsMapProps {
  meetings: any[];
}

// Fix for default markers
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.setIcon(defaultIcon);

const MeetingLocationsMap: React.FC<MeetingLocationsMapProps> = ({ meetings }) => {
  const [locations, setLocations] = useState<MeetingLocation[]>([]);
  const [center, setCenter] = useState<[number, number]>([20, 0]);

  useEffect(() => {
    // Extract unique locations with meeting counts
    const locationMap = new Map<string, MeetingLocation>();

    meetings.forEach((meeting) => {
      // Get coordinates - try location coordinates first, then fallback to gpsCoordinates
      const latitude = meeting.location?.latitude || meeting.gpsCoordinates?.latitude;
      const longitude = meeting.location?.longitude || meeting.gpsCoordinates?.longitude;

      // Only include if we have valid coordinates
      if (latitude && longitude) {
        // If using location coordinates, group by location._id
        // If using GPS coordinates, use meeting._id to keep them separate
        const isUsingLocationCoords = meeting.location?.latitude && meeting.location?.longitude;
        const locId = isUsingLocationCoords 
          ? meeting.location?._id 
          : `gps-${meeting._id}`;
        
        const locName = meeting.location?.name || 'Meeting Location';
        const locAddress = meeting.location?.address || '';
        
        const existing = locationMap.get(locId) || {
          _id: locId,
          name: locName,
          address: locAddress,
          latitude: latitude,
          longitude: longitude,
          meetingCount: 0
        };
        existing.meetingCount += 1;
        locationMap.set(locId, existing);
      }
    });

    const locationsList = Array.from(locationMap.values());
    setLocations(locationsList);

    // Calculate center as average of all locations
    if (locationsList.length > 0) {
      const avgLat = locationsList.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / locationsList.length;
      const avgLng = locationsList.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / locationsList.length;
      setCenter([avgLat, avgLng]);
    }
  }, [meetings]);

  if (locations.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f9fafb',
        borderRadius: '4px',
        flexDirection: 'column',
        color: '#9ca3af'
      }}>
        <Icon icon="mdi:map-outline" width="48" height="48" style={{ marginBottom: '12px', opacity: 0.3 }} />
        <p>No locations to display on map</p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: '4px', overflow: 'hidden', height: '450px' }}>
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location) => (
          <Marker
            key={location._id}
            position={[location.latitude || 0, location.longitude || 0]}
            icon={defaultIcon}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h6 style={{ marginBottom: '8px', fontWeight: 600 }}>{location.name}</h6>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  {location.address}
                </p>
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#3b82f6'
                }}>
                  {location.meetingCount} Meeting{location.meetingCount !== 1 ? 's' : ''}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MeetingLocationsMap;
