import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import ConnectForm from "./ConnectForm";

type IntegrationFieldContextType = {
  openConnectForm: () => void;
  closeConnectForm: () => void;
  data?: any;
  isFormOpen: boolean;
  setData: (data: any) => void;
};

export const IntegrationFieldContext =
  createContext<IntegrationFieldContextType | null>(null);

const IntegrationFieldProvider = ({ children }: { children: ReactNode }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [data, setData] = useState(null);

  const openConnectForm = () => {
    setIsFormOpen(true);
  };

  const closeConnectForm = () => {
    setIsFormOpen(false);
  };

  return (
    <IntegrationFieldContext.Provider
      value={{
        isFormOpen,
        openConnectForm,
        closeConnectForm,
        data,
        setData,
      }}
    >
      {children}
    </IntegrationFieldContext.Provider>
  );
};

export const useIntegrationField = () => {
  const context = useContext(IntegrationFieldContext);
  if (context === null) {
    throw new Error(
      "useIntegrationField must be used within a IntegrationFieldProvider"
    );
  }
  return context;
};

export default IntegrationFieldProvider;
