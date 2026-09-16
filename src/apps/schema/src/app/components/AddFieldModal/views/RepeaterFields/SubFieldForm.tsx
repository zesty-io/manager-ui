import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import isEmpty from "lodash/isEmpty";

import {
  ContentModelField,
  ContentModelFieldDataType,
  FieldSettingsOptions,
  RepeaterSubField,
} from "shell/services/types";
import {
  FieldFormProvider,
  useFieldForm,
  FieldBody,
} from "../../../contexts/FieldFormProvider";
import {
  getFieldCopyConfig,
  getFormConfig,
  getTypeText,
} from "../../../configs";
import { Learn } from "../../Learn";
import { Rules } from "../Rules";
import { Details } from "../../Details";
import { useMediaRules } from "../../../hooks/useMediaRules";
import { FieldIcon } from "../../../Field/FieldIcon";
import { getCategory } from "../../../../utils";

type SubFieldFormProps = {
  type: ContentModelFieldDataType;
  name: string;
  onModalClose: () => void;
  onBackClick?: () => void;
  fields: ContentModelField[];
  fieldData?: ContentModelField;
  onSubmit: (payload: RepeaterSubField, createAnotherField?: boolean) => void;
  subFields: RepeaterSubField[];
  repeaterFieldName?: string;
};

type ActiveTab = "details" | "rules" | "learn";
type Params = {
  id: string;
};
const SubFieldFormContent = ({
  type,
  name,
  fields,
  fieldData,
  onModalClose,
  onBackClick,
  onSubmit,
  repeaterFieldName,
}: SubFieldFormProps) => {
  const { t } = useTranslation();
  const TYPE_TEXT = getTypeText(t);
  const FIELD_COPY_CONFIG = getFieldCopyConfig(t);
  const FORM_CONFIG = getFormConfig(t);
  const isUpdateField = !isEmpty(fieldData);
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const {
    formData,
    errors,
    setErrors,
    handleFieldDataChange,
    isDefaultValueEnabled,
    setIsDefaultValueEnabled,
  } = useFieldForm();
  const { mediaFoldersOptions } = useMediaRules();
  const params = useParams<Params>();
  const { id } = params;

  const handleSubmit = (createAnotherField?: boolean) => {
    setIsSubmitClicked(true);
    const hasErrors = Object.values(errors)
      .flat(2)
      .some((error: any) => error?.length);
    const highestSortValue = fields.reduce(
      (max, field) => (field.sort > max ? field.sort : max),
      0
    );

    if (hasErrors) {
      // Switch the active tab to details to show the user the errors if
      // they're not on the details tab and they clicked the submit button
      if (
        errors.defaultValue ||
        errors.minCharLimit ||
        errors.maxCharLimit ||
        errors.regexMatchPattern ||
        errors.regexMatchErrorMessage ||
        errors.regexRestrictPattern ||
        errors.regexRestrictErrorMessage ||
        errors.minValue ||
        errors.maxValue ||
        errors.fileExtensions ||
        errors.fileExtensionsErrorMessage
      ) {
        setActiveTab("rules");
      } else {
        setActiveTab("details");
      }

      return;
    }

    // Common field values
    let body: RepeaterSubField = {
      name: formData.name as string,
      label: formData.label as string,
      description: formData.description as string,
      datatype: type,
      required: formData.required as boolean,
      settings: {
        list: formData.list as boolean,
        limit: formData.limit as number,
        group_id: formData.group_id as string,
        ...((formData.tooltip as string)?.length && {
          tooltip: formData.tooltip as string,
        }),
        defaultValue: formData.defaultValue as string,
        ...(formData.maxCharLimit !== null && {
          maxCharLimit: formData.maxCharLimit as number,
        }),
        ...(formData.minCharLimit !== null && {
          minCharLimit: formData.minCharLimit as number,
        }),
        ...(formData.regexMatchPattern && {
          regexMatchPattern: formData.regexMatchPattern as string,
        }),
        ...(formData.regexMatchErrorMessage && {
          regexMatchErrorMessage: formData.regexMatchErrorMessage as string,
        }),
        ...(formData.regexRestrictPattern && {
          regexRestrictPattern: formData.regexRestrictPattern as string,
        }),
        ...(formData.regexRestrictErrorMessage && {
          regexRestrictErrorMessage:
            formData.regexRestrictErrorMessage as string,
        }),
        ...(formData.minValue !== null && {
          minValue: formData.minValue as number,
        }),
        ...(formData.maxValue !== null && {
          maxValue: formData.maxValue as number,
        }),
        ...(formData.currency !== null && {
          currency: formData.currency as string,
        }),
        ...(formData.fileExtensions && {
          fileExtensions: formData.fileExtensions as string[],
        }),
        ...(formData.fileExtensionsErrorMessage && {
          fileExtensionsErrorMessage:
            formData.fileExtensionsErrorMessage as string,
        }),
      },
      sort: isUpdateField ? fieldData.sort : highestSortValue + 1, // Just use the length since sort starts at 0
    };

    if (type === "dropdown" || type === "yes_no") {
      const options = formData.options as FieldSettingsOptions[];
      const optionsObject = options.reduce(
        (acc: FieldSettingsOptions, curr: FieldSettingsOptions) => {
          return { ...acc, ...curr };
        },
        {}
      );

      body.settings.options = optionsObject;
    }

    onSubmit(body, createAnotherField);
  };

  return (
    <>
      <DialogTitle
        component="div"
        sx={{
          borderBottom: "2px solid",
          borderColor: "border",
          pb: 0,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            {!isUpdateField && (
              <IconButton
                data-cy="BackToFieldSelectionBtn"
                size="small"
                onClick={onBackClick}
                sx={{ mr: 1.5 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box pr={1.5}>
              <FieldIcon
                type={type}
                height="28px"
                width="28px"
                fontSize="16px"
              />
            </Box>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5" fontWeight={700}>
                {isUpdateField
                  ? t("schema.subFieldFormEditTitle", {
                      label: fieldData.label,
                    })
                  : t("schema.subFieldFormAddTitle", { name })}
              </Typography>
              <Typography variant="body3" color="text.secondary">
                {isUpdateField
                  ? t("schema.subFieldFormTypeFieldLabel", {
                      type: TYPE_TEXT[type],
                    })
                  : FIELD_COPY_CONFIG[getCategory(type)]?.find(
                      (item) => item.type === type
                    )?.subHeaderText}
              </Typography>
            </Box>
          </Box>
          <IconButton
            data-cy="AddFieldCloseBtn"
            size="small"
            onClick={onModalClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, value: ActiveTab) => setActiveTab(value)}
          sx={{
            position: "relative",
            top: "2px",
          }}
        >
          <Tab
            data-cy="DetailsTabBtn"
            value="details"
            label={t("schema.tabDetails")}
            icon={<SettingsRoundedIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            data-cy="RulesTabBtn"
            value="rules"
            label={t("schema.tabRules")}
            icon={<RuleRoundedIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            data-cy="LearnTabBtn"
            value="learn"
            label={t("schema.tabLearn")}
            icon={<MenuBookRoundedIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 2.5,
          pl: activeTab === "details" ? 0 : 2.5,
          backgroundColor: "grey.50",
          borderTop: 0,
        }}
      >
        {activeTab === "details" && (
          <Details
            type={type}
            isUpdateField={isUpdateField}
            fieldData={fieldData}
            onFieldDataChange={handleFieldDataChange}
            formData={formData}
            isSubmitClicked={isSubmitClicked}
            errors={errors}
            repeaterFieldName={repeaterFieldName}
          />
        )}
        {activeTab === "rules" && (
          <Rules
            type={type}
            onFieldDataChanged={handleFieldDataChange}
            formData={formData}
            isSubmitClicked={isSubmitClicked}
            errors={errors}
            isDefaultValueEnabled={isDefaultValueEnabled}
            setIsDefaultValueEnabled={setIsDefaultValueEnabled}
            mediaFoldersOptions={mediaFoldersOptions}
          />
        )}
        {activeTab === "learn" && <Learn type={type} />}
      </DialogContent>
      {isUpdateField ? (
        <DialogActions
          sx={{
            pt: 2.5,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={onModalClose}
            sx={{
              mr: 1,
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            data-cy="SubFieldFormAddFieldBtn"
            onClick={() => handleSubmit()}
            variant="contained"
            startIcon={<SaveRoundedIcon />}
          >
            {t("common.save")}
          </Button>
        </DialogActions>
      ) : (
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2.5,
          }}
        >
          <Button variant="outlined" color="inherit" onClick={onBackClick}>
            {t("common.cancel")}
          </Button>
          <Box>
            <Button
              data-cy="SubFieldFormAddAnotherFieldBtn"
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              sx={{
                mr: 2,
              }}
              onClick={() => handleSubmit(true)}
            >
              {t("schema.addAnotherField")}
            </Button>
            <Button
              data-cy="SubFieldFormAddFieldBtn"
              onClick={() => handleSubmit()}
              variant="contained"
            >
              {t("schema.addField")}
            </Button>
          </Box>
        </DialogActions>
      )}
    </>
  );
};

export const SubFieldForm = (props: SubFieldFormProps) => {
  return (
    <FieldFormProvider
      type={props.type}
      fields={props.subFields}
      fieldData={props.fieldData}
    >
      <SubFieldFormContent {...props} />
    </FieldFormProvider>
  );
};
