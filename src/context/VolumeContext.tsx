import { createContext, FC, ReactNode, useState } from "react";

export const VolumeContext = createContext({
  isMuted: true,
  setIsMuted: (value: boolean) => {
    value;
  },
});

const VolumeContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <VolumeContext.Provider value={{ isMuted, setIsMuted }}>
      {children}
    </VolumeContext.Provider>
  );
};

export default VolumeContextProvider;
