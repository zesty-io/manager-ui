import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Errors,
  FormValue,
} from "../../../apps/schema/src/app/components/AddFieldModal/views/FieldForm";
import {
  IntegrationTypes,
  APIHeader,
  DataKeys,
  DisplayPath,
  IntegrationFieldConfig,
  IntegrationDisplay,
} from "./configs";

type IntegrationFieldContextType = {
  openForm: () => void;
  closeForm: () => void;
  isFormOpen: boolean;
  activeStep: number;
  setActiveStep: (step: number) => void;
  integrationEndPoint: string | null;
  setIntegrationEndPoint: (integrationEndPoint: string | null) => void;
  integrationType: IntegrationTypes;
  setIntegrationType: (type: IntegrationTypes | null) => void;
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
  propertyPaths: DisplayPath;
  setPropertyPaths: (propertyPaths: DisplayPath) => void;
  integrationConfig: IntegrationFieldConfig;
  setIntegrationConfig: (integrationConfig: IntegrationFieldConfig) => void;
  remoteSelectorOpen: boolean;
  setRemoteSelectorOpen: (remoteSelectorOpen: boolean) => void;
  selectedItems: string[];
  setSelectedItems: (selectedItems: string[]) => void;
  displayListData: IntegrationDisplay[] | null;
  setDisplayListData: (displayListData: IntegrationDisplay[] | null) => void;
  jsonViewerIsOpen: boolean;
  setJsonViewerIsOpen: (jsonViewerIsOpen: boolean) => void;
  jsonData: any | null;
  setjsonData: (jsonData: any | null) => void;
  onChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
};

export const IntegrationFieldContext =
  createContext<IntegrationFieldContextType | null>(null);

const IntegrationFieldProvider = ({
  onChange,
  children,
}: {
  onChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
  children: ReactNode;
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [jsonViewerIsOpen, setJsonViewerIsOpen] = useState(false);

  const [integrationEndPoint, setIntegrationEndPoint] = useState<string | null>(
    null
  );
  const [integrationType, setIntegrationType] =
    useState<IntegrationTypes | null>(null);
  const [headers, setHeaders] = useState<APIHeader[] | null>(null);
  const [apiData, setApiData] = useState<any | null>(null);

  const [dataPathOptions, setDataPathOptions] = useState<string[]>([]);

  const [displayPathOptions, setDisplayPathOptions] = useState<string[]>([]);

  const [displayData, setDisplayData] = useState<any | null>(null);

  const [remoteSelectorOpen, setRemoteSelectorOpen] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [jsonData, setjsonData] = useState<any | null>(null);

  const [displayListData, setDisplayListData] = useState<
    IntegrationDisplay[] | null
  >([]);

  const [propertyPaths, setPropertyPaths] = useState<DisplayPath | null>({
    dataPath: "",
    heading: "",
    subHeading: "",
    detail: "",
    image: "",
    details: [],
  });

  const [integrationConfig, setIntegrationConfig] =
    useState<IntegrationFieldConfig>({
      integrationEndPoint: null,
      integrationType: null,
      integrationHeaders: null,
    });

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
        integrationEndPoint,
        setIntegrationEndPoint,
        integrationType,
        setIntegrationType,
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
        propertyPaths,
        setPropertyPaths,
        integrationConfig,
        setIntegrationConfig,
        remoteSelectorOpen,
        setRemoteSelectorOpen,
        selectedItems,
        setSelectedItems,
        displayListData,
        setDisplayListData,
        jsonViewerIsOpen,
        setJsonViewerIsOpen,
        jsonData,
        setjsonData,
        onChange,
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
