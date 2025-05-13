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
import { CreateRedirectErrors, parseRedirectError } from "./constants";
import CreateForm from "./CreateRedirects/CreateForm";

import { DeleteDialog, DeleteRedirectsProps } from "./DeleteDialog";
import ErrorDialog from "./ErrorDialog";

export type CreateFormDefaultValues = {
  ZUID: string;
  code: RedirectsCodes;
  target: string;
  targetType: RedirectsTargetType;
  path: string;
};

const RedirectsDialogContext = createContext(null);

const RedirectsDialogContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [createFormOpen, setCreateFormOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [createRedirectErrors, setCreateRedirectErrors] =
    useState<CreateRedirectErrors>();
  const [deleteRedirects, setDeleteRedirects] = useState<
    DeleteRedirectsProps[]
  >([]);
  const [createFormDefaultValues, setCreateFormDefaultValues] =
    useState<CreateFormDefaultValues | null>(null);

  const openCreateForm = (data: CreateFormDefaultValues = null) => {
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
        let reqData = {
          path,
          targetType,
          code,
          target,
        };
        let response: any = undefined;
        if (!!ZUID) {
          response = await updateRedirect({ ZUID: ZUID, body: reqData });
        } else {
          response = await createRedirect(reqData);
        }

        if (!!response?.error) {
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
    const redirectRequests = [...new Set(paths)]?.map((path) => {
      return request({
        path: path,
        targetType: targetType,
        code: code,
        target: target,
      });
    });

    const redirectsResponses: Awaited<any> = await Promise.allSettled(
      redirectRequests
    );
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

      <CreateForm
        open={createFormOpen}
        onClose={closeCreateForm}
        defaultValues={createFormDefaultValues}
      />
      <ErrorDialog
        open={errorDialogOpen}
        onClose={closeErrorDialog}
        data={createRedirectErrors}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        redirects={deleteRedirects}
      />
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
