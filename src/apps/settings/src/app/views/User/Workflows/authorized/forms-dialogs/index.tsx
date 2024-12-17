import { createContext, useContext, useState, useCallback } from "react";
import {
  StatusLabel,
  StatusLabelQuery,
} from "../../../../../../../../../shell/services/types";

import DeactivationDialog from "./DeactivationDialog";
import StatusLabelForm from "./StatusLabelForm";

// Types for StatusLabelForm and DeactivationDialog
export type OpenStatusLabelFormTypes = {
  labels?: StatusLabelQuery[] | [];
  values?: StatusLabel;
  isDeactivated?: boolean;
};

export type OpenDeactivationDialogTypes = {
  ZUID: string;
  name: string;
  callBack?: () => void;
};

// FormDialogContext Types
export type FormDialogContextTypes = {
  openStatusLabelForm: ({
    values,
    labels,
    isDeactivated,
  }: OpenStatusLabelFormTypes) => void;
  closeStatusLabelForm: () => void;
  openDeactivationDialog: ({
    ZUID,
    name,
    callBack,
  }: OpenDeactivationDialogTypes) => void;
  closeDeactivationDialog: () => void;
  focusedLabel: string | undefined;
  setFocusedLabel: (id: string | undefined) => void;
};

const FormDialogContext = createContext<FormDialogContextTypes | null>(null);

const FormDialogContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [focusedLabel, setFocusedLabel] = useState<string | undefined>(
    undefined
  );

  // Form dialog states
  const [formIsOpen, setFormIsOpen] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<
    OpenStatusLabelFormTypes | undefined
  >(undefined);

  // Deactivation dialog states
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [dialogProps, setDialogProps] = useState<
    OpenDeactivationDialogTypes | undefined
  >(undefined);

  // Handlers for status label form dialog
  const openStatusLabelForm = useCallback(
    ({ values, labels, isDeactivated }: OpenStatusLabelFormTypes) => {
      setFormValues({ values, labels, isDeactivated });
      setFormIsOpen(true);
    },
    []
  );

  const closeStatusLabelForm = useCallback(() => {
    setFormValues(undefined);
    setFormIsOpen(false);
  }, []);

  // Handlers for deactivation dialog
  const openDeactivationDialog = useCallback(
    ({ ZUID, name, callBack }: OpenDeactivationDialogTypes) => {
      setDialogProps({ ZUID, name, callBack });
      setDialogIsOpen(true);
    },
    []
  );

  const closeDeactivationDialog = useCallback(() => {
    setDialogProps(undefined);
    setDialogIsOpen(false);
  }, []);

  return (
    <FormDialogContext.Provider
      value={{
        openStatusLabelForm,
        closeStatusLabelForm,
        openDeactivationDialog,
        closeDeactivationDialog,
        focusedLabel,
        setFocusedLabel,
      }}
    >
      {children}
      <StatusLabelForm
        open={formIsOpen}
        onClose={closeStatusLabelForm}
        labels={formValues?.labels}
        values={formValues?.values}
        isDeactivated={formValues?.isDeactivated}
      />
      <DeactivationDialog
        open={dialogIsOpen}
        onClose={closeDeactivationDialog}
        {...dialogProps}
      />
    </FormDialogContext.Provider>
  );
};

export const useFormDialogContext = () => {
  const context = useContext(FormDialogContext);
  if (context === null) {
    throw new Error(
      "useFormDialogContext must be used within a FormDialogContextProvider"
    );
  }
  return context;
};

export default FormDialogContextProvider;
