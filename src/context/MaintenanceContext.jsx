/**
 * Maintenance mode — blur overlay on customer site; admins unaffected.
 */

import { createContext, useContext, useEffect, useState } from "react";
import MaintenanceOverlay from "../Components/MaintenanceOverlay.jsx";
import { apiRequest } from "../lib/api";

const MaintenanceContext = createContext({
  isInMaintenance: false,
  maintenanceMessage: "",
});

export function useMaintenanceMode() {
  return useContext(MaintenanceContext);
}

export function MaintenanceModeProvider({ children }) {
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const checkMaintenanceStatus = async () => {
      try {
        const res = await apiRequest("/public/maintenance-status", {
          skipAuth: true,
        });
        if (cancelled) return;
        const enabled = Boolean(res?.data?.enabled);
        setIsInMaintenance(enabled);
        setMaintenanceMessage(
          enabled
            ? res?.data?.message ||
                "App is in maintenance. Please try again later."
            : "",
        );
      } catch {
        if (!cancelled) {
          setIsInMaintenance(false);
          setMaintenanceMessage("");
        }
      }
    };

    checkMaintenanceStatus();
    const interval = setInterval(checkMaintenanceStatus, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isInMaintenance) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isInMaintenance]);

  return (
    <MaintenanceContext.Provider
      value={{ isInMaintenance, maintenanceMessage }}
    >
      <div className="relative min-h-screen">
        <div
          className={
            isInMaintenance
              ? "pointer-events-none select-none blur-md saturate-50 transition-[filter] duration-300"
              : ""
          }
          aria-hidden={isInMaintenance}
        >
          {children}
        </div>
        {isInMaintenance ? (
          <MaintenanceOverlay message={maintenanceMessage} />
        ) : null}
      </div>
    </MaintenanceContext.Provider>
  );
}
