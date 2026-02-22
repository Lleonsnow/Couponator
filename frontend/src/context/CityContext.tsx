"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ALL_CITIES, CITIES, getStoredCity, setStoredCity } from "@/lib/cities";

type CityContextValue = {
  city: string;
  setCity: (city: string) => void;
  cities: string[];
  allCitiesLabel: string;
};

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<string>("Москва");
  useEffect(() => {
    setCityState(getStoredCity());
  }, []);

  const setCity = useCallback((next: string) => {
    if (next !== getStoredCity()) {
      setStoredCity(next);
      setCityState(next);
    }
  }, []);

  const value = useMemo<CityContextValue>(
    () => ({
      city,
      setCity,
      cities: CITIES,
      allCitiesLabel: ALL_CITIES,
    }),
    [city, setCity]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}
