import { Dispatch, createContext, useReducer, useState } from "react";

type AIGeneratorParameterContextType = [
  Record<string, string>,
  Dispatch<Record<string, string> | null>
];
export const AIGeneratorParameterContext =
  createContext<AIGeneratorParameterContextType>([{}, () => {}]);

type AIGeneratorParameterProviderProps = {
  children?: React.ReactNode;
};

// This context provider is used to temporarily store the ai parameters
// used when generating a meta title is then used to prefill the
// meta description ai parameters during the AI-assisted metadata flow
export const AIGeneratorParameterProvider = ({
  children,
}: AIGeneratorParameterProviderProps) => {
  const [AIGeneratorParameters, updateAIGeneratorParameters] = useState<Record<
    string,
    string
  > | null>(null);
  return (
    <AIGeneratorParameterContext.Provider
      value={[AIGeneratorParameters, updateAIGeneratorParameters]}
    >
      {children}
    </AIGeneratorParameterContext.Provider>
  );
};
