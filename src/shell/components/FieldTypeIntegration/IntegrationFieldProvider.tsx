import {
  createContext,
  ReactNode,
  useCallback,
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
import { generateItemId } from "./utils";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
}

export type IntegrationDefaultValues = {
  value: any[];
  display: IntegrationFieldDisplay | null;
  config: IntegrationFieldApiConfig | null;
};

export type IntegrationConfig = {
  status: "completed" | "incomplete";
  display: IntegrationFieldDisplay | null;
  api: IntegrationFieldApiConfig | null;
};

const fetchApi = async <T = unknown,>({
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
  isFetching: boolean;
  fetchApi: <T = unknown>({
    endpoint,
    headers,
  }: {
    endpoint: string;
    headers?: IntegrationRequestHeaders | null;
  }) => Promise<ApiResponse<T>>;
  isFormOpen: boolean;
  setIsFormOpen: (isFormOpen: boolean) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  connectionError: boolean;
  setConnectionError: (connectionError: boolean) => void;
  maxItems: number | null;
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
  defaultValues: IntegrationDefaultValues | null;
  triggerFetch: () => void;
  config: IntegrationConfig | null;
  closeForm: () => void;
  save: (data: IntegrationConfig) => void;
};

export const IntegrationFieldContext =
  createContext<IntegrationFieldContextType | null>(null);

const IntegrationFieldProvider = ({
  maxItems,
  defaultValues,
  children,
}: {
  maxItems: number | null;
  isLoading: boolean;
  formType: "configure" | "select";
  defaultValues: IntegrationDefaultValues;
  children: ReactNode;
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<IntegrationConfig | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [value, setValue] = useState<any[] | undefined>(
    !defaultValues?.value?.length
      ? undefined
      : defaultValues?.value?.map((item: any) => ({
          ...item,
          _itemId: generateItemId(item, defaultValues?.display?.keyPaths),
        }))
  );
  const [endpoint, setEndpoint] = useState<string>(
    defaultValues?.config?.endpoint || ""
  );
  const [headers, setHeaders] = useState<IntegrationRequestHeaders | null>(
    defaultValues?.config?.headers || null
  );
  const [keyPaths, setKeyPaths] = useState<IntegrationKeyPaths | null>(
    defaultValues?.display?.keyPaths || null
  );
  const [displayType, setDisplayType] = useState<IntegrationTypes | null>(
    defaultValues?.display?.type || null
  );

  const [apiData, setApiData] = useState<any | null>(null);

  const triggerFetch = async () => {
    setIsFetching(true);

    const { status, data } = await fetchApi({
      endpoint: endpoint,
      headers: headers,
    });

    if (status === "success") {
      setApiData(data);
      setConnectionError(false);
      setIsConnected(true);
    } else {
      setApiData(null);
      setConnectionError(true);
      setIsConnected(false);
    }
    setIsFetching(false);
  };

  const save = useCallback(
    (data?: IntegrationConfig) => {
      const completed =
        !!endpoint && !!keyPaths && !!displayType && !!isConnected;

      const configRaw: IntegrationConfig = !data
        ? {
            status: completed ? "completed" : "incomplete",
            api: {
              endpoint,
              headers,
            },
            display: {
              type: displayType,
              keyPaths,
            },
          }
        : data;
      setConfig(configRaw);
    },
    [endpoint, keyPaths, displayType, isConnected, isFormOpen]
  );

  useEffect(() => {
    if (!!endpoint && !!displayType) {
      setIsConnected(true);
    }
  }, [endpoint, keyPaths, displayType, isConnected, isFormOpen]);

  const closeForm = () => {
    save();
    setIsFormOpen(false);
  };

  return (
    <IntegrationFieldContext.Provider
      value={{
        isFormOpen,
        setIsFormOpen,
        activeStep,
        setActiveStep: (step) => setActiveStep(step),
        isConnected,
        setIsConnected: (isConnected) => setIsConnected(isConnected),
        fetchApi,
        triggerFetch,
        isFetching,
        connectionError,
        setConnectionError,
        maxItems,
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
        defaultValues,
        config,
        save,
        closeForm,
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
