import {
  Dispatch,
  createContext,
  useReducer,
  useState,
  ReactNode,
} from "react";

import { ToneOption } from "./AIGenerator";

type ParameterData = {
  topic?: string;
  audienceDescription: string;
  tone: ToneOption;
  keywords?: string;
  limit?: number;
  language: {
    label: string;
    value: string;
  };
};
type AIGeneratorContextType = [
  string | null,
  Dispatch<string | null>,
  Record<string, ParameterData>,
  Dispatch<Record<string, ParameterData>>
];

export const AIGeneratorContext = createContext<AIGeneratorContextType>([
  null,
  () => {},
  null,
  () => {},
]);

type AIGeneratorProviderProps = {
  children?: ReactNode;
};
export const AIGeneratorProvider = ({ children }: AIGeneratorProviderProps) => {
  const [lastOpenedItem, setLastOpenedItem] = useState<string>(null);
  // const [parameterData, setParameterData] = useState<Record<string, ParameterData>>(null);
  const [parameterData, updateParameterData] = useReducer(
    (
      state: Record<string, ParameterData>,
      action: Record<string, ParameterData>
    ) => {
      const newState = {
        ...state,
        ...action,
      };
      return newState;
    },
    {}
  );

  return (
    <AIGeneratorContext.Provider
      value={[
        lastOpenedItem,
        setLastOpenedItem,
        parameterData,
        updateParameterData,
      ]}
    >
      {children}
    </AIGeneratorContext.Provider>
  );
};
