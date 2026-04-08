import { createContext, useContext, useState, useEffect } from 'react';

const HotelContext = createContext();

export const HOTELS = ['ALL', 'AWH', 'MEDICAL COLLEGE', 'STARCARE'];

export const HotelProvider = ({ children }) => {
  const [selectedHotel, setSelectedHotel] = useState(() => {
    return localStorage.getItem('restautrack_hotel') || HOTELS[0];
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
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
