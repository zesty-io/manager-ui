import { createContext, useContext, useState } from "react";

import * as WorkflowStatus from "./constants";
import CreateNewStatusLabelForm from "./CreateStatusLabelForm";
import ConfirmDelete from "./ConfirmDelete";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../../shell/store/notifications";

const ACTIVE_STATUS_LABELS = [
  {
    sort: 1,
    zuid: WorkflowStatus.DEFAULT_STATUS_ZUIDS.DRAFT,
    name: WorkflowStatus.DEFAULT_STATUS_NAMES.DRAFT,
    description: WorkflowStatus.DEFAULT_STATUS_DESC.DRAFT,
    color: WorkflowStatus.COLOR_HEX.BLUE,
    allowPublish: false,
    addPermissionRole: "31-71cfc74-0wn3r,31-71cfc74-1fg6t",
    removePermissionRole: "31-71cfc74-4dm13",
  },
  {
    sort: 2,
    zuid: WorkflowStatus.DEFAULT_STATUS_ZUIDS.NEEDS_REVIEW,
    name: WorkflowStatus.DEFAULT_STATUS_NAMES.NEEDS_REVIEW,
    description: WorkflowStatus.DEFAULT_STATUS_DESC.NEEDS_REVIEW,
    color: WorkflowStatus.COLOR_HEX.ORANGE,
    allowPublish: true,
    addPermissionRole: "31-71cfc74-p0bl1shr",
    removePermissionRole: "31-71cfc74-4dm13,31-71cfc74-p0bl1shr",
  },
];

const DEACTIVATED_STATUS_LABELS = [
  {
    sort: 1,
    zuid: WorkflowStatus.DEFAULT_STATUS_ZUIDS.NEEDS_REVIEW,
    name: WorkflowStatus.DEFAULT_STATUS_NAMES.NEEDS_REVIEW,
    description: WorkflowStatus.DEFAULT_STATUS_DESC.NEEDS_REVIEW,
    color: WorkflowStatus.COLOR_HEX.ORANGE,
    allowPublish: true,
    addPermissionRole: "31-71cfc74-p0bl1shr",
    removePermissionRole: "31-71cfc74-4dm13,31-71cfc74-p0bl1shr",
  },
  {
    sort: 2,
    zuid: WorkflowStatus.DEFAULT_STATUS_ZUIDS.APPROVED,
    name: WorkflowStatus.DEFAULT_STATUS_NAMES.APPROVED,
    description: WorkflowStatus.DEFAULT_STATUS_DESC.APPROVED,
    color: WorkflowStatus.COLOR_HEX.GREEN,
    allowPublish: true,
    addPermissionRole: "31-71cfc74-0wn3r,31-71cfc74-1fg6t,31-71cfc74-p0bl1shr",
    removePermissionRole: "31-71cfc74-4dm13,31-71cfc74-p0bl1shr",
  },
];

type ConfirmDialogProps = {
  zuid: string;
  labelName: string;
};

type WorkflowContextTypes = {
  activeStatusLabels: WorkflowStatus.StatusLabelProps[] | [];
  deactivatedStatusLabels: WorkflowStatus.StatusLabelProps[] | [];
  openStatusLabelForm: (data?: WorkflowStatus.StatusLabelProps | null) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  openDeleteConfirm: ({ zuid, labelName }: ConfirmDialogProps) => void;
};

export const WorkflowContext = createContext<WorkflowContextTypes | null>(null);

export const WorkflowProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch();
  const [activeStatusLabels, setActiveStatusLabels] =
    useState<WorkflowStatus.StatusLabelProps[]>(ACTIVE_STATUS_LABELS);
  const [deactivatedStatusLabels, setDeactivatedStatusLabels] = useState<
    WorkflowStatus.StatusLabelProps[]
  >(DEACTIVATED_STATUS_LABELS);

  const [statusLabelFormOpen, setStatusLabelFormOpen] =
    useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);

  const [statusLabelFormDefaultValues, setStatusLabelFormDefaultValues] =
    useState<WorkflowStatus.StatusLabelProps | undefined>(undefined);

  const [searchString, setSearchString] = useState<string>("");

  const [confirmDeleteAttributes, setConfirmDeleteAttributes] =
    useState<ConfirmDialogProps>();

  const openStatusLabelForm = (data?: WorkflowStatus.StatusLabelProps) => {
    setStatusLabelFormDefaultValues(data);
    setStatusLabelFormOpen(true);
  };

  const closeStatusLabelForm = () => {
    setStatusLabelFormDefaultValues(undefined);
    setStatusLabelFormOpen(false);
  };

  const setSearchValue = (value: string) => {
    setSearchString(value);
  };

  const openDeleteConfirm = ({ zuid, labelName }: ConfirmDialogProps) => {
    setConfirmDeleteAttributes({
      zuid,
      labelName,
    });
    setConfirmDeleteOpen(true);
  };

  const deactivateStatusLabel = (zuid: string, label: string) => {
    dispatch(
      notify({
        kind: "error",
        message: `Status De-activated: ${label}`,
      })
    );
  };

  return (
    <WorkflowContext.Provider
      value={{
        activeStatusLabels,
        deactivatedStatusLabels,
        openStatusLabelForm,
        searchValue: searchString,
        setSearchValue,
        openDeleteConfirm,
      }}
    >
      {children}
      <CreateNewStatusLabelForm
        open={statusLabelFormOpen}
        onClose={closeStatusLabelForm}
        defaultValues={statusLabelFormDefaultValues}
        usedLabels={activeStatusLabels}
      />
      <ConfirmDelete
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onDelete={deactivateStatusLabel}
        {...confirmDeleteAttributes}
      />
    </WorkflowContext.Provider>
  );
};
export const useWorkflowStatus = () => {
  const context = useContext(WorkflowContext);
  if (context === null) {
    throw new Error("useWorkflowStatus must be used within a WorkflowProvider");
  }
  return context;
};
