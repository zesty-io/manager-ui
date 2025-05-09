import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
import { useCreateRedirectMutation } from "../../../../../../shell/services/instance";
import {
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";
import { CreateRedirectErrors, parseRedirectError } from "./constants";
import CreateForm from "./CreateRedirects/CreateForm";
import { DeleteDialog, DeleteDialogProps } from "./DeleteDialog";
import ErrorDialog from "./ErrorDialog";

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
  const [deleteData, setDeleteData] = useState<DeleteDialogProps>(null);

  const openCreateForm = () => setCreateFormOpen(true);
  const closeCreateForm = () => setCreateFormOpen(false);

  const openErrorDialog = (errors: CreateRedirectErrors) => {
    setCreateRedirectErrors(errors);
    setErrorDialogOpen(true);
  };
  const closeErrorDialog = () => setErrorDialogOpen(false);

  const openDeleteDialog = (data: DeleteDialogProps) => {
    setDeleteData(data);
    setDeleteDialogOpen(true);
  };
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  const [createRedirect, { isLoading: isCreatingRedirect }] =
    useCreateRedirectMutation();

  const sendCreateRedirectRequests = useCallback(
    async ({
      paths,
      target,
      targetType,
      code,
    }: {
      paths: string[];
      target: string;
      targetType: RedirectsTargetType;
      code: RedirectsCodes;
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
          const response: any = await createRedirect({
            path,
            targetType,
            code,
            target,
          });
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
        createRedirects: sendCreateRedirectRequests,
        isCreatingRedirect,
        openDeleteDialog,
        closeDeleteDialog,
      }}
    >
      {children}

      <CreateForm open={createFormOpen} onClose={closeCreateForm} />
      <ErrorDialog
        open={errorDialogOpen}
        onClose={closeErrorDialog}
        data={createRedirectErrors}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        ZUID={deleteData?.ZUID}
        path={deleteData?.path}
        type={deleteData?.type}
        target={deleteData?.target}
        code={deleteData?.code}
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
