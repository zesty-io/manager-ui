import { ReactNode, useState } from "react";
import { AutocompleteProps, Popper, styled, TextField } from "@mui/material";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import { ListboxComponent } from "../utils/virtualization";

export interface FieldTypeOneToManyProps
  extends Omit<
    AutocompleteProps<any, boolean, boolean, boolean>,
    "onOpen" | "renderInput"
  > {
  placeholder?: string;
  required?: boolean;
  /**
   * Callback to be fired upon opening the dropdown
   */
  onOpen: () => Promise<any>;
  /**
   * Structure for option
   */
  options: {
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
  }[];
}

export const FieldTypeOneToMany = ({
  placeholder = "Select relationships...",
  onOpen,
  options,
  required,
  ...props
}: FieldTypeOneToManyProps) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

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
        <TextField {...params} placeholder={placeholder} />
      )}
      options={loading ? [] : options}
      getOptionLabel={(option) => option.inputLabel}
      renderOption={(props, option) => [props, option.component]}
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
