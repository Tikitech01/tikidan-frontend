import { getApiUrl } from './api';

let trackingInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Captures the employee's current location and sends it to the backend
 */
async function captureAndLogLocation(token: string): Promise<void> {
  try {
    if (!navigator.geolocation) {
      console.warn('🚫 Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          const response = await fetch(`${getApiUrl()}/reports/log-location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              latitude,
              longitude,
              accuracy
            })
          });

          if (response.ok) {
            await response.json();
            console.log(`📍 Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } else {
            console.error('Failed to log location:', response.statusText);
          }
        } catch (error) {
          console.error('Error sending location to backend:', error);
        }
      },
      (error) => {
        console.warn('🚫 Geolocation error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } catch (error) {
    console.error('Error capturing location:', error);
  }
}

/**
 * Starts automatic location tracking every 5 minutes
 * Captures location immediately and then every 5 minutes
 */
export function startLocationTracking(token: string): void {
  if (trackingInterval) {
    console.log('⚠️  Location tracking already started');
    return;
  }

  console.log('▶️  Starting location tracking (every 5 minutes)');
  
  // Capture location immediately
  captureAndLogLocation(token);
  
  // Then capture every 5 minutes
  trackingInterval = setInterval(() => {
    captureAndLogLocation(token);
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Stops automatic location tracking
 */
export function stopLocationTracking(): void {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
    console.log('⏹️  Location tracking stopped');
  }
}
