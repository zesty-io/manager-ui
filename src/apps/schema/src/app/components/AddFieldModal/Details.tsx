import { useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  ListItem,
  Typography,
} from "@mui/material";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";

import {
  ContentModelField,
  ContentModelFieldDataType,
} from "../../../../../../shell/services/types";
import { Errors, FormData } from "./views/FieldForm";
import { FORM_CONFIG } from "../configs";
import {
  AutocompleteConfig,
  DropdownOptions,
  FieldFormInput,
} from "./FieldFormInput";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelsQuery,
} from "../../../../../../shell/services/instance";
import {
  currencies,
  Currency,
} from "../../../../../../shell/components/FieldTypeCurrency/currencies";

type DetailsProps = {
  type: ContentModelFieldDataType;
  onFieldDataChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: any;
  }) => void;
  formData: FormData;
  isSubmitClicked?: boolean;
  errors: Errors;
  fieldStateOnSaveAction?: "deactivate" | "reactivate";
  setFieldStateOnSaveAction?: (value: "deactivate" | "reactivate") => void;
  isUpdateField?: boolean;
  fieldData?: ContentModelField;
  isDeletingField?: boolean;
  isUndeletingField?: boolean;
  canDeactivate?: boolean;
};

export const Details = ({
  type,
  isUpdateField,
  fieldData,
  onFieldDataChange,
  formData,
  isSubmitClicked,
  errors,
  fieldStateOnSaveAction,
  setFieldStateOnSaveAction,
  isDeletingField,
  isUndeletingField,
  canDeactivate,
}: DetailsProps) => {
  const { data: allModels, isLoading: isLoadingModels } =
    useGetContentModelsQuery();
  const {
    data: selectedModelFields,
    isFetching: isFetchingSelectedModelFields,
  } = useGetContentModelFieldsQuery(
    { modelZUID: formData?.relatedModelZUID as string },
    {
      skip: !formData.relatedModelZUID,
    }
  );

  const modelsOptions: DropdownOptions[] = useMemo(() => {
    return allModels
      ?.map((model) => {
        return {
          label: model.label,
          value: model.ZUID,
        };
      })
      ?.sort((a, b) => a.label.localeCompare(b.label));
  }, [allModels]);

  const fieldsOptions: DropdownOptions[] = useMemo(() => {
    return (
      selectedModelFields
        ?.filter((field) => !field.deletedAt)
        ?.map((field) => ({
          label: field.label,
          value: field.ZUID,
        })) || []
    );
  }, [selectedModelFields]);

  return (
    <Grid
      data-cy="DetailsTab"
      container
      rowSpacing={2.5}
      columnSpacing={2.5}
      width="inherit"
      ml={0}
    >
      {FORM_CONFIG[type]?.details?.map((fieldConfig, index) => {
        // Only show tooltip field when updating a field that already has a tooltip value
        const hideTooltipField =
          fieldConfig.name === "tooltip" &&
          (!isUpdateField || !fieldData.settings?.tooltip?.length);

        if (hideTooltipField) return;

        let dropdownOptions: DropdownOptions[] = [];
        let disabled = false;
        let renderOption: any;
        let filterOptions: any;
        let autocompleteConfig: AutocompleteConfig = {};

        if (fieldConfig.name === "relatedModelZUID") {
          dropdownOptions = modelsOptions;
          disabled = isLoadingModels;
        }

        if (fieldConfig.name === "relatedFieldZUID") {
          dropdownOptions = fieldsOptions;
          disabled = isFetchingSelectedModelFields;
        }

        if (fieldConfig.name === "currency") {
          const selectedValue = currencies.find(
            (currency) => currency.value === formData.currency
          );
          dropdownOptions = currencies;
          renderOption = (props: any, value: Currency) => (
            <ListItem
              {...props}
              key={value.value}
              sx={{ color: "text.primary" }}
            >
              <Box
                component="img"
                height={16}
                src={`/images/flags/${value.countryCode?.toLowerCase()}.svg`}
                loading="lazy"
                alt={`${value.countryCode} flag`}
              />
              <Typography variant="body1" fontWeight={700} pl={1}>
                {value.value} {value.symbol_native} &nbsp;
              </Typography>
              <Typography variant="body1">{value.label}</Typography>
            </ListItem>
          );
          filterOptions = (options: Currency[], state: any) => {
            if (state.inputValue) {
              return options.filter(
                (option) =>
                  option.label
                    ?.toLowerCase()
                    .includes(state.inputValue.toLowerCase()) ||
                  option.value
                    ?.toLowerCase()
                    .includes(state.inputValue.toLowerCase())
              );
            } else {
              return options;
            }
          };
          autocompleteConfig.inputProps = {
            startAdornment: !!selectedValue && (
              <InputAdornment
                position="start"
                sx={{
                  pl: 0.25,
                  "&.MuiInputAdornment-root.MuiInputAdornment-positionStart": {
                    color: "text.primary",
                  },
                }}
              >
                <Box
                  component="img"
                  height={16}
                  src={`/images/flags/${selectedValue.countryCode?.toLowerCase()}.svg`}
                  loading="lazy"
                  alt={`${selectedValue.countryCode} flag`}
                />
                <Typography variant="body1" fontWeight={700} pl={1}>
                  {selectedValue.value} {selectedValue.symbol_native}
                </Typography>
              </InputAdornment>
            ),
          };

          autocompleteConfig.maxHeight = 256;
        }

        return (
          <FieldFormInput
            key={index}
            fieldConfig={fieldConfig}
            onDataChange={onFieldDataChange}
            errorMsg={isSubmitClicked && errors[fieldConfig.name]}
            prefillData={formData[fieldConfig.name]}
            dropdownOptions={dropdownOptions}
            disabled={disabled}
            renderOption={renderOption}
            filterOptions={filterOptions}
            autocompleteConfig={autocompleteConfig}
          />
        );
      })}
      {canDeactivate && isUpdateField && (
        <Grid size={12}>
          <Button
            data-cy="DeactivateReactivateFieldUpdateModal"
            variant="outlined"
            color="inherit"
            startIcon={
              fieldStateOnSaveAction === "deactivate" ? (
                <PlayCircleFilledRoundedIcon color="action" />
              ) : (
                <PauseCircleOutlineRoundedIcon color="action" />
              )
            }
            onClick={() => {
              setFieldStateOnSaveAction(
                fieldStateOnSaveAction === "deactivate"
                  ? "reactivate"
                  : "deactivate"
              );
            }}
            loading={isDeletingField || isUndeletingField}
          >
            {fieldStateOnSaveAction === "deactivate"
              ? "Reactivate Field"
              : "Deactivate Field"}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};
