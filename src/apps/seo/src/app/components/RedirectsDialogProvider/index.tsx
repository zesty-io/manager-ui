import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
import {
  useCreateRedirectMutation,
  useUpdateRedirectMutation,
} from "../../../../../../shell/services/instance";
import {
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";
import { CreateRedirectErrors } from "./constants";
import CreateForm from "./CreateRedirects/CreateForm";
import { DeleteDialog, DeleteRedirectsProps } from "./DeleteDialog";
import ErrorDialog from "./ErrorDialog";

export type CreateFormDefaultValues = {
  ZUID?: string;
  code?: RedirectsCodes;
  target?: string;
  targetType?: RedirectsTargetType;
  path?: string;
};

export const parseRedirectError = (error: string): string => {
  if (error?.toLowerCase()?.includes("already exists")) return "Already exists";
  if (error?.toLowerCase()?.includes("validation error: redirect item"))
    return "Not Published";
  return "Error";
};

type RedirectsDialogContextType = {
  openCreateForm: (
    data?: CreateFormDefaultValues | null,
    isInternal?: boolean
  ) => void;
  closeCreateForm: () => void;
  openErrorDialog: (errors: CreateRedirectErrors) => void;
  closeErrorDialog: () => void;
  isLoading: boolean;
  createRedirects: (params: {
    paths: string[];
    targetType: RedirectsTargetType;
    code: RedirectsCodes;
    target: string;
  }) => Promise<any>;
  updateRedirect: (params: {
    path: string;
    targetType: RedirectsTargetType;
    code: RedirectsCodes;
    target: string;
    ZUID: string;
  }) => Promise<any>;
  openDeleteDialog: (data: DeleteRedirectsProps[]) => void;
  closeDeleteDialog: () => void;
};

const RedirectsDialogContext = createContext<RedirectsDialogContextType | null>(
  null
);

const RedirectsDialogContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [createFormOpen, setCreateFormOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isInternal, setIsInternal] = useState<boolean>(false);
  const [createRedirectErrors, setCreateRedirectErrors] =
    useState<CreateRedirectErrors>();
  const [deleteRedirects, setDeleteRedirects] = useState<
    DeleteRedirectsProps[]
  >([]);
  const [createFormDefaultValues, setCreateFormDefaultValues] =
    useState<CreateFormDefaultValues | null>(null);

  const openCreateForm = (
    data: CreateFormDefaultValues | null = null,
    isInternal: boolean = false
  ) => {
    setIsInternal(isInternal);
    setCreateFormDefaultValues(data);
    setCreateFormOpen(true);
  };
  const closeCreateForm = () => setCreateFormOpen(false);

  const openErrorDialog = (errors: CreateRedirectErrors) => {
    setCreateRedirectErrors(errors);
    setErrorDialogOpen(true);
  };
  const closeErrorDialog = () => setErrorDialogOpen(false);

  const openDeleteDialog = (data: DeleteRedirectsProps[]) => {
    setDeleteRedirects(data);
    setDeleteDialogOpen(true);
  };
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  const [createRedirect, { isLoading: isCreatingRedirect }] =
    useCreateRedirectMutation();
  const [updateRedirect, { isLoading: isUpdatingRedirect }] =
    useUpdateRedirectMutation();

  const sendRedirectRequest = async ({
    paths,
    target,
    targetType,
    code,
    ZUID,
  }: {
    paths: string[];
    target: string;
    targetType: RedirectsTargetType;
    code: RedirectsCodes;
    ZUID?: string | null;
  }) => {
    const request = async ({
      path,
      targetType,
      code,
      target,
    }: {
      path: string;
      targetType: RedirectsTargetType;
      code: RedirectsCodes;
      target: string;
    }) => {
      const responseData = {
        status: "success",
        message: "",
        data: {},
      };
      try {
        const reqData = {
          path,
          targetType,
          code,
          target,
        };
        let response: any;
        if (ZUID) {
          response = await updateRedirect({ ZUID, body: reqData });
        } else {
          response = await createRedirect(reqData);
        }

        if (response?.error) {
          throw new Error(response?.error?.data?.error);
        }
      } catch (error) {
        responseData.status = "error";
        responseData.message = parseRedirectError(error?.message);
        responseData.data = {
          path,
          targetType,
          code,
          target,
        };
      }
      return responseData;
    };

    const redirectRequests = [...new Set(paths)]?.map((path) =>
      request({ path, targetType, code, target })
    );

    const redirectsResponses = await Promise.allSettled(redirectRequests);
    return redirectsResponses.map((item: any) => ({
      status: item?.value.status,
      message: item?.value?.message,
      path: item?.value?.data?.path,
    }));
  };

  const createRedirectRequest = useCallback(
    async ({
      paths,
      targetType,
      code,
      target,
    }: {
      paths: string[];
      targetType: RedirectsTargetType;
      code: RedirectsCodes;
      target: string;
    }) => {
      return sendRedirectRequest({ paths, targetType, code, target });
    },
    []
  );

  const updateRedirectRequest = useCallback(
    async ({
      path,
      targetType,
      code,
      target,
      ZUID,
    }: {
      path: string;
      targetType: RedirectsTargetType;
      code: RedirectsCodes;
      target: string;
      ZUID: string;
    }) => {
      return sendRedirectRequest({
        paths: [path],
        targetType,
        code,
        target,
        ZUID,
      });
    },
    []
  );

  return (
    <RedirectsDialogContext.Provider
      value={{
        openCreateForm,
        closeCreateForm,
        openErrorDialog,
        closeErrorDialog,
        isLoading: isUpdatingRedirect || isCreatingRedirect,
        createRedirects: createRedirectRequest,
        updateRedirect: updateRedirectRequest,
        openDeleteDialog,
        closeDeleteDialog,
      }}
    >
      {children}

      {createFormOpen && (
        <CreateForm
          open={createFormOpen}
          onClose={closeCreateForm}
          defaultValues={createFormDefaultValues}
          isInternal={isInternal}
        />
      )}
      {errorDialogOpen && (
        <ErrorDialog
          open={errorDialogOpen}
          onClose={closeErrorDialog}
          data={createRedirectErrors}
        />
      )}
      {deleteDialogOpen && (
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          redirects={deleteRedirects}
        />
      )}
    </RedirectsDialogContext.Provider>
  );
};

export const useRedirectsDialog = () => {
  const context = useContext(RedirectsDialogContext);
  if (context === null) {
    throw new Error(
      "useRedirectsDialogContext must be used within a RedirectsDialogContextProvider"
    );
  }
  return context;
};

export default RedirectsDialogContextProvider;
