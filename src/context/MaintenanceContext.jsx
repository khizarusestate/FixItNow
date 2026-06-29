/**
 * FILE: frontend/src/context/MaintenanceContext.jsx
 * 
 * Check and provide maintenance mode status
 */

import { createContext, useContext, useEffect, useState } from 'react';
import MaintenanceScreen from '../Components/MaintenanceScreen';
import { apiRequest } from '../lib/api';

const MaintenanceContext = createContext();

export function useMaintenanceMode() {
  return useContext(MaintenanceContext);
}

export function MaintenanceModeProvider({ children }) {
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMaintenanceStatus();
    // Check every 10 seconds if app is still in maintenance
    const interval = setInterval(checkMaintenanceStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkMaintenanceStatus = async () => {
    try {
      // Try to call a simple endpoint that's protected by maintenance middleware
      await apiRequest('/bookings');
      // If we get here, app is not in maintenance
      setIsInMaintenance(false);
      setMaintenanceMessage('');
    } catch (error) {
      // Check if it's a 503 maintenance error
      if (error?.status === 503 && error?.data?.maintenanceMode) {
        setIsInMaintenance(true);
        setMaintenanceMessage(
          error.data.message || 'App is in maintenance. Please try again later.'
        );
      } else {
        setIsInMaintenance(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Or a loading screen
  }

  if (isInMaintenance) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }

  return (
    <MaintenanceContext.Provider value={{ isInMaintenance, maintenanceMessage }}>
      {children}
    </MaintenanceContext.Provider>
  );
}
