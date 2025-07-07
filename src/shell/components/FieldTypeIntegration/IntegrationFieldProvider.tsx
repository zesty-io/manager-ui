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
import { generateItemId, getKeyValue } from "./utils";

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
  isConnecting: boolean;
  setIsConnecting: (isConnecting: boolean) => void;
  connectionError: boolean;
  setConnectionError: (connectionError: boolean) => void;
  remoteSelectorOpen: boolean;
  setRemoteSelectorOpen: (remoteSelectorOpen: boolean) => void;
  selectedItems: any[];
  setSelectedItems: (selectedItems: any) => void;
  removeSelectedItem: (id: string) => void;
  jsonViewerIsOpen: boolean;
  setJsonViewerIsOpen: (jsonViewerIsOpen: boolean) => void;
  jsonData: any | null;
  setJsonData: (jsonData: any | null) => void;
  maxItems: number | null;
  //NEW
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
  apiResponseData: any | null;
  setApiResponseData: (data: any) => void;
  rootDataArray: any | null;
  setRootDataArray: (data: any) => void;
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  const [isConnected, setIsConnected] = useState(false);
  const [jsonViewerIsOpen, setJsonViewerIsOpen] = useState(false);

  const [remoteSelectorOpen, setRemoteSelectorOpen] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [jsonData, setJsonData] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [autoRequest, setAutoRequest] = useState(true);
  const [value, setValue] = useState<any | null>(null);
  const [endpoint, setEndpoint] = useState<string>("");
  const [headers, setHeaders] = useState<IntegrationRequestHeaders | null>(
    null
  );
  const [keyPaths, setKeyPaths] = useState<IntegrationKeyPaths | null>(null);
  const [displayType, setDisplayType] = useState<IntegrationTypes | null>(null);

  const [apiResponseData, setApiResponseData] = useState<any | null>(null);
  const [rootDataArray, setRootDataArray] = useState<any | null>(null);

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
      setApiResponseData(data);
      const extractedData = (
        !keyPaths?.rootPath
          ? data
          : getKeyValue(data as object, keyPaths?.rootPath)
      )?.map((item: any) => ({
        ...item,
        _itemId: generateItemId(item, keyPaths),
      }));

      setRootDataArray(extractedData);
      setConnectionError(false);
    } else {
      setApiResponseData(null);
      setRootDataArray(null);
      setConnectionError(true);
    }
    setIsFetching(false);
  };

  const removeSelectedItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newItems = prev.filter((i) => i?._itemId !== itemId);
      setValue(!newItems?.length ? "" : JSON.stringify(newItems)?.trim());
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
      !!apiResponseData ||
      !!connectionError ||
      !autoRequest
    )
      return;
    sendApiQueryRequest();
  }, [endpoint, isLoading, apiResponseData, connectionError, autoRequest]);

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
        remoteSelectorOpen,
        setRemoteSelectorOpen,
        selectedItems,
        setSelectedItems,
        removeSelectedItem,
        jsonViewerIsOpen,
        setJsonViewerIsOpen,
        jsonData,
        setJsonData,
        queryApi: queryApi,
        fetchApi: sendApiQueryRequest,
        isFetching,
        isConnecting,
        setIsConnecting,
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
        apiResponseData,
        setApiResponseData,
        rootDataArray,
        setRootDataArray,
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
