import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  IntegrationDisplayType,
  APIHeader,
  DataKeys,
  DisplayPath,
  IntegrationConfig,
} from "./configs";

type IntegrationFieldContextType = {
  openForm: () => void;
  closeForm: () => void;
  isFormOpen: boolean;
  activeStep: number;
  setActiveStep: (step: number) => void;
  endpoint: string | null;
  setEndpoint: (endpoint: string | null) => void;
  type: IntegrationDisplayType;
  setType: (type: IntegrationDisplayType | null) => void;
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  headers: APIHeader[] | null;
  setHeaders: (headers: APIHeader[] | null) => void;
  apiData: any | null;
  setApiData: (apiData: any | null) => void;

  dataPathOptions: string[];
  setDataPathOptions: (dataPathOptions: string[]) => void;
  displayPathOptions: string[];
  setDisplayPathOptions: (displayPathOptions: string[]) => void;
  displayData: any | null;
  setDisplayData: (displayData: any | null) => void;
  displayPaths: DisplayPath;
  setDisplayPaths: (displayPaths: DisplayPath) => void;
  integrationConfig: IntegrationConfig;
  setIntegrationConfig: (integrationConfig: IntegrationConfig) => void;
  remoteSelectorOpen: boolean;
  setRemoteSelectorOpen: (remoteSelectorOpen: boolean) => void;
};

export const IntegrationFieldContext =
  createContext<IntegrationFieldContextType | null>(null);

const IntegrationFieldProvider = ({ children }: { children: ReactNode }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isConnected, setIsConnected] = useState(false);

  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [type, setType] = useState<IntegrationDisplayType | null>(null);
  const [headers, setHeaders] = useState<APIHeader[] | null>(null);
  const [apiData, setApiData] = useState<any | null>(null);

  const [dataPathOptions, setDataPathOptions] = useState<string[]>([]);

  const [displayPathOptions, setDisplayPathOptions] = useState<string[]>([]);

  const [displayData, setDisplayData] = useState<any | null>(null);

  const [remoteSelectorOpen, setRemoteSelectorOpen] = useState(false);

  const [displayPaths, setDisplayPaths] = useState<DisplayPath | null>({
    dataPath: "",
    heading: "",
    subHeading: "",
    detail: "",
    image: "",
    details: [],
  });

  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>(
    {
      endpoint: null,
      type: null,
      headers: null,
    }
  );

  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  return (
    <IntegrationFieldContext.Provider
      value={{
        isFormOpen,
        openForm,
        closeForm,
        endpoint,
        setEndpoint,
        type,
        setType,
        activeStep,
        setActiveStep: (step) => setActiveStep(step),
        isConnected,
        setIsConnected: (isConnected) => setIsConnected(isConnected),
        headers,
        setHeaders,
        apiData,
        setApiData,

        dataPathOptions,
        setDataPathOptions,
        displayPathOptions,
        setDisplayPathOptions,
        displayData,
        setDisplayData,
        displayPaths,
        setDisplayPaths,
        integrationConfig,
        setIntegrationConfig,
        remoteSelectorOpen,
        setRemoteSelectorOpen,
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
