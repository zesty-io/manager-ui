import { createContext } from "react";
import { Error } from "../../apps/content-editor/src/app/components/Editor/Field/FieldShell";

type ContentFieldErrorsContext = {
  fieldErrors: Record<string, string[]>;
  updateFieldErrors: (fieldName: string, error: Error) => void;
};

export const ContentFieldErrorsContext = createContext<
  ContentFieldErrorsContext | undefined
>({
  fieldErrors: {},
  updateFieldErrors: () => {},
});
