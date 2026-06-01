import { createContext, useContext, useMemo } from "react";

const AppDataContext = createContext({
  catalog: null,
  customerBookings: null,
});

export function AppDataProvider({ catalog, customerBookings, children }) {
  const value = useMemo(
    () => ({ catalog, customerBookings }),
    [catalog, customerBookings],
  );
  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
