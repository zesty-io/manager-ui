import { ReactNode, useState, useMemo } from "react";
import {
  AutocompleteProps,
  Popper,
  styled,
  TextField,
  InputAdornment,
} from "@mui/material";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import { AppLink } from "@zesty-io/core/AppLink";
import { ListboxComponent } from "../utils/virtualization";
import { store } from "../../store";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { OneToManyOptions } from "../FieldTypeOneToMany";
import { resolveRelatedOptions } from "../FieldTypeOneToMany/util";
import styles from "../FieldTypeOneToMany/Field.less";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type OneToOneOptions = {
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
export interface FieldTypeOneToOneProps
  extends Omit<
    AutocompleteProps<any, boolean, boolean, boolean>,
    "onOpen" | "renderInput" | "options"
  > {
  name: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  error?: boolean;
  required?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  /**
   * Callback to be fired upon opening the dropdown
   */
  onOpen?: typeof store.dispatch;
  /**
   * Structure for option
   */
  relatedFieldZUID: string;
  relatedModelZUID: string;
  langID: number;
  value: any;
}

export const FieldTypeOneToOne = ({
  label,
  helperText,
  placeholder = "Select relationship...",
  error,
  onOpen,
  required,
  startAdornment,
  endAdornment,
  relatedFieldZUID,
  relatedModelZUID,
  langID,
  value,
  ...props
}: FieldTypeOneToOneProps) => {
  const allItems = useSelector(
    (state: AppState) => state.content,
    (prevState, nextState) =>
      Object.keys(prevState)?.length === Object.keys(nextState)?.length
  );
  const allFields = useSelector((state: AppState) => state.fields);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const oneToOneOptions: OneToManyOptions[] = useMemo(() => {
    const options = [
      {
        inputLabel: "- None -",
        value: null,
        component: "- None -",
      },
      ...resolveRelatedOptions(
        allFields,
        allItems,
        relatedFieldZUID,
        relatedModelZUID,
        langID,
        value
      ),
    ];

    if (value && !options.find((opt) => opt.value === value)) {
      //the related option is not in the array, we need to insert it
      options.unshift({
        value: value as string,
        inputLabel: `Selected item not found: ${value}`,
        component: (
          <span>
            <span onClick={(evt) => evt.stopPropagation()}>
              <AppLink
                className={styles.relatedItemLink}
                to={`/content/${relatedModelZUID}/${value}`}
              >
                <FontAwesomeIcon icon={faEdit} />
              </AppLink>
            </span>
            &nbsp;Selected item not found: {value}
          </span>
        ),
      });
    }

    return options;
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
      disableListWrap
      disableClearable
      disablePortal
      size="small"
      PopperComponent={StyledPopper}
      ListboxComponent={ListboxComponent}
      renderInput={(params) => (
        <TextField
          {...params}
          helperText={helperText}
          error={error}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="end">{startAdornment}</InputAdornment>
            ),
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                <InputAdornment
                  sx={{ position: "relative", right: "40px" }}
                  position="end"
                >
                  {endAdornment}
                </InputAdornment>
              </>
            ),
          }}
        />
      )}
      options={loading ? [] : oneToOneOptions}
      getOptionLabel={(option) => option.inputLabel}
      renderOption={(props, option) => [props, option.component]}
      value={
        oneToOneOptions?.find((options) => options.value === value) || null
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
