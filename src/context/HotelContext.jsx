import { createContext, useContext, useState, useEffect } from 'react';

const HotelContext = createContext();

// SALARY replaces the old ALL aggregation tab
export const HOTELS = ['AWH', 'MEDICAL COLLEGE', 'STARCARE', 'SALARY'];

export const HotelProvider = ({ children }) => {
  const [selectedHotel, setSelectedHotel] = useState(() => {
    const stored = localStorage.getItem('restautrack_hotel');
    // If stored value is no longer valid (e.g. old 'ALL'), fall back to first hotel
    return HOTELS.includes(stored) ? stored : HOTELS[0];
  });

  useEffect(() => {
    localStorage.setItem('restautrack_hotel', selectedHotel);
  }, [selectedHotel]);

  return (
    <HotelContext.Provider value={{ selectedHotel, setSelectedHotel, hotels: HOTELS }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel must be used within a HotelProvider');
  return context;
};
