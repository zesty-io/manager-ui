import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  IntegrationTypes,
  IntegrationKeyPaths,
  IntegrationRequestHeaders,
  IntegrationFieldApiConfig,
  IntegrationFieldDisplay,
} from "../../services/types";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

const queryApi = async <T = unknown,>({
  endpoint,
  headers,
}: {
  endpoint: string;
  headers?: IntegrationRequestHeaders | null;
}): Promise<ApiResponse<T>> => {
  try {
    const reqOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
    };

    const fetchResponse = await fetch(endpoint, reqOptions);
    const response = await (() => {
      if (!fetchResponse.ok) {
        return fetchResponse
          .json()
          .then((errorData) => ({
            status: "error" as const,

            data: errorData as T,
          }))
          .catch(() => ({
            status: "error" as const,
            data: fetchResponse.statusText as T,
          }));
      }
      return fetchResponse.json().then((data) => ({
        status: "success" as const,
        data: data as T,
      }));
    })();

    return response;
  } catch (error) {
    return {
      status: "error",
      data: (error.message || "Unknown error") as T,
    };
  }
};

type IntegrationFieldContextType = {
  openForm: () => void;
  closeForm: () => void;
  isFetching: boolean;
  fetchApi: () => void;
  queryApi: <T = unknown>({
    endpoint,
    headers,
  }: {
    endpoint: string;
    headers?: IntegrationRequestHeaders | null;
  }) => Promise<ApiResponse<T>>;
  isFormOpen: boolean;
  activeStep: number;
  setActiveStep: (step: number) => void;
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  connectionError: boolean;
  setConnectionError: (connectionError: boolean) => void;
  formSelectorOpen: boolean;
  setFormSelectorOpen: (formSelectorOpen: boolean) => void;
  removeItem: (id: string) => void;
  jsonViewerIsOpen: boolean;
  setJsonViewerIsOpen: (jsonViewerIsOpen: boolean) => void;
  jsonData: any | null;
  setJsonData: (jsonData: any | null) => void;
  maxItems: number | null;
  apiConfig: IntegrationFieldApiConfig;
  setApiConfig: (config: IntegrationFieldApiConfig) => void;
  displayConfig: IntegrationFieldDisplay;
  setDisplayConfig: (display: IntegrationFieldDisplay) => void;
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
  headers: IntegrationRequestHeaders | null;
  setHeaders: (headers: IntegrationRequestHeaders | null) => void;
  keyPaths: IntegrationKeyPaths;
  setKeyPaths: (keyPaths: IntegrationKeyPaths) => void;
  displayType: IntegrationTypes | null;
  setDisplayType: (type: IntegrationTypes | null) => void;
  value: any;
  setValue: (value: any) => void;
  apiData: any | null;
  setApiData: (data: any) => void;
  autoRequest: boolean;
  setAutoRequest: (autoRequest: boolean) => void;
};

export const IntegrationFieldContext =
  createContext<IntegrationFieldContextType | null>(null);

const IntegrationFieldProvider = ({
  maxItems,
  isLoading = false,
  children,
}: {
  maxItems: number | null;
  isLoading: boolean;
  children: ReactNode;
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  const [isConnected, setIsConnected] = useState(false);
  const [jsonViewerIsOpen, setJsonViewerIsOpen] = useState(false);

  const [formSelectorOpen, setFormSelectorOpen] = useState(false);
  const [jsonData, setJsonData] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [autoRequest, setAutoRequest] = useState(true);
  const [value, setValue] = useState<any[] | undefined>(undefined);
  const [endpoint, setEndpoint] = useState<string>("");
  const [headers, setHeaders] = useState<IntegrationRequestHeaders | null>(
    null
  );
  const [keyPaths, setKeyPaths] = useState<IntegrationKeyPaths | null>(null);
  const [displayType, setDisplayType] = useState<IntegrationTypes | null>(null);

  const [apiData, setApiData] = useState<any | null>(null);

  const [apiConfig, setApiConfig] = useState<IntegrationFieldApiConfig>({
    endpoint: "",
    headers: null,
  });
  const [displayConfig, setDisplayConfig] = useState<IntegrationFieldDisplay>({
    type: null,
    keyPaths: null,
  });

  const sendApiQueryRequest = async () => {
    setIsFetching(true);

    const { status, data } = await queryApi({
      endpoint: endpoint,
      headers: headers,
    });

    if (status === "success") {
      setApiData(data);
      setConnectionError(false);
    } else {
      setApiData(null);
      setConnectionError(true);
    }
    setIsFetching(false);
  };

  const removeItem = (itemId: string) => {
    setValue((prev) => {
      const newItems = prev.filter((i) => i?._itemId !== itemId);
      setValue(!newItems?.length ? [] : newItems);
      return newItems;
    });
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  useEffect(() => {
    if (
      !endpoint ||
      !!isLoading ||
      !!apiData ||
      !!connectionError ||
      !autoRequest
    )
      return;
    sendApiQueryRequest();
  }, [endpoint, isLoading, apiData, connectionError, autoRequest]);

  useEffect(() => {
    if (!!keyPaths && !!endpoint && displayType) {
      setApiConfig({
        endpoint: endpoint,
        headers: headers,
      });

      setDisplayConfig({
        type: displayType,
        keyPaths: keyPaths,
      });

      setIsConnected(true);
    }
  }, [keyPaths, endpoint, headers, displayType]);

  return (
    <IntegrationFieldContext.Provider
      value={{
        isFormOpen,
        openForm,
        closeForm,
        activeStep,
        setActiveStep: (step) => setActiveStep(step),
        isConnected,
        setIsConnected: (isConnected) => setIsConnected(isConnected),
        formSelectorOpen,
        setFormSelectorOpen,
        removeItem,
        jsonViewerIsOpen,
        setJsonViewerIsOpen,
        jsonData,
        setJsonData,
        queryApi: queryApi,
        fetchApi: sendApiQueryRequest,
        isFetching,
        connectionError,
        setConnectionError,
        maxItems,
        apiConfig,
        setApiConfig,
        displayConfig,
        setDisplayConfig,
        endpoint,
        setEndpoint,
        headers,
        setHeaders,
        keyPaths,
        setKeyPaths,
        displayType,
        setDisplayType,
        value,
        setValue,
        apiData,
        setApiData,
        autoRequest,
        setAutoRequest,
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
