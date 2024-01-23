import { ReactNode, useMemo, useState } from "react";
import { AutocompleteProps, Popper, styled, TextField } from "@mui/material";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import { ListboxComponent } from "../utils/virtualization";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { resolveRelatedOptions } from "./util";

export type OneToManyOptions = {
  /**
   * Component to be rendered in the dropdown
   */
  component: ReactNode | string;
  /**
   * Value of option
   */
  value: string;
  /**
   * Label that should display in the input when selected
   */
  inputLabel: string;
};
export interface FieldTypeOneToManyProps
  extends Omit<
    AutocompleteProps<any, boolean, boolean, boolean>,
    "onOpen" | "renderInput" | "options"
  > {
  name: string;
  placeholder?: string;
  required?: boolean;
  /**
   * Callback to be fired upon opening the dropdown
   */
  onOpen: () => Promise<any>;
  /**
   * Structure for option
   */
  error?: boolean;
  relatedFieldZUID: string;
  relatedModelZUID: string;
  langID: number;
  value: any;
}

export const FieldTypeOneToMany = ({
  placeholder = "Select relationships...",
  onOpen,
  required,
  error,
  relatedFieldZUID,
  relatedModelZUID,
  langID,
  value,
  ...props
}: FieldTypeOneToManyProps) => {
  const allItems = useSelector(
    (state: AppState) => state.content,
    (prevState, nextState) =>
      Object.keys(prevState)?.length === Object.keys(nextState)?.length
  );
  const allFields = useSelector((state: AppState) => state.fields);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const oneToManyOptions: OneToManyOptions[] = useMemo(() => {
    return resolveRelatedOptions(
      allFields,
      allItems,
      relatedFieldZUID,
      relatedModelZUID,
      langID,
      value
    );
  }, [
    Object.keys(allFields).length,
    Object.keys(allItems).length,
    relatedModelZUID,
    relatedFieldZUID,
    langID,
    value,
  ]);

  const handleOpen = () => {
    if (!loaded && onOpen) {
      onOpen().then(() => {
        setLoading(false);
      });
      setLoading(true);
      setLoaded(true);
    }
  };

  return (
    <Autocomplete
      onOpen={handleOpen}
      loading={loading}
      fullWidth
      multiple
      disableListWrap
      disableClearable
      disablePortal
      size="small"
      PopperComponent={StyledPopper}
      ListboxComponent={ListboxComponent}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} error={error} />
      )}
      options={loading ? [] : oneToManyOptions}
      getOptionLabel={(option) => option.inputLabel}
      renderOption={(props, option) => [props, option.component]}
      value={
        (value &&
          (value as string)
            ?.split(",")
            ?.map(
              (value: any) =>
                oneToManyOptions?.find(
                  (options) => options.value === value
                ) || { value, inputLabel: value, component: value }
            )) ||
        []
      }
      {...props}
    />
  );
};

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0,
    },
  },
});
