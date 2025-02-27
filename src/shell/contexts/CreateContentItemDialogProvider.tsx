import React, { createContext, useState, Dispatch } from "react";

type CreateContentItemDialogContextType = [
  string,
  Dispatch<string>,
  string,
  Dispatch<string>
];
export const CreateContentItemDialogContext =
  createContext<CreateContentItemDialogContextType>([
    null,
    () => {},
    null,
    () => {},
  ]);

type CreateContentItemDialogProviderType = {
  children?: React.ReactNode;
};
export const CreateContentItemDialogProvider = ({
  children,
}: CreateContentItemDialogProviderType) => {
  const [initiatorZUID, setInitiatorZUID] = useState<string>(null);
  const [newlyCreatedItemZUID, setNewlyCreatedItemZUID] =
    useState<string>(null);

  return (
    <CreateContentItemDialogContext.Provider
      value={[
        initiatorZUID,
        setInitiatorZUID,
        newlyCreatedItemZUID,
        setNewlyCreatedItemZUID,
      ]}
    >
      {children}
    </CreateContentItemDialogContext.Provider>
  );
};
