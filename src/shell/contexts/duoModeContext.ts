import { createContext } from "react";

type DuoModeContextType = {
  value: boolean;
  setValue: (newValue: boolean) => void;
  isDisabled: boolean;
};

export const DuoModeContext = createContext<DuoModeContextType | undefined>(
  undefined
);
