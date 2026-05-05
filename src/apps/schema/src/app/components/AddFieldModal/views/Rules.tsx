import { useState } from "react";
import { Stack } from "@mui/material";
import { FieldSettingsOptions } from "../../../../../../../shell/services/types";

import { FieldType, FORM_CONFIG } from "../../configs";
import { CustomGroup } from "../../hooks/useMediaRules";
import { CharacterLimit } from "../CharacterLimit";
import { ComingSoon } from "../ComingSoon";
import { DefaultValue } from "../DefaultValue";
import { MediaRules } from "../MediaRules";
import { Errors, FormData, FormValue } from "./FieldForm";
import { Regex } from "../Regex";
import { InputRange } from "../InputRange";

type RulesProps = {
  type: FieldType;
  onFieldDataChanged: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
  mediaFoldersOptions: CustomGroup[];
  formData: FormData;
  errors: Errors;
  isSubmitClicked: boolean;
  isDefaultValueEnabled: boolean;
  setIsDefaultValueEnabled: (value: boolean) => void;
};
export const Rules = ({
  type,
  onFieldDataChanged,
  mediaFoldersOptions,
  formData,
  errors,
  isSubmitClicked,
  isDefaultValueEnabled,
  setIsDefaultValueEnabled,
}: RulesProps) => {
  const [isCharacterLimitEnabled, setIsCharacterLimitEnabled] = useState(
    formData?.minCharLimit !== null && formData?.maxCharLimit !== null
  );

  if (type === "uuid" || type === "block_selector" || type === "repeater") {
    return <ComingSoon />;
  }

  return (
    <Stack gap={2.5}>
      {type !== "integration" && (
        <DefaultValue
          type={type}
          value={formData["defaultValue"]}
          onChange={(value) => {
            onFieldDataChanged({ inputName: "defaultValue", value });
          }}
          isDefaultValueEnabled={isDefaultValueEnabled}
          setIsDefaultValueEnabled={setIsDefaultValueEnabled}
          error={isSubmitClicked && (errors["defaultValue"] as string)}
          mediaRules={{
            limit: formData["limit"],
            group_id: formData["group_id"],
          }}
          relationshipFields={{
            relatedModelZUID: formData["relatedModelZUID"] as string,
            relatedFieldZUID: formData["relatedFieldZUID"] as string,
          }}
          options={formData["options"] as FieldSettingsOptions[]}
          currency={(formData["currency"] as string) || "USD"}
          fieldLabel={formData["label"] as string}
        />
      )}

      {type === "images" && (
        <MediaRules
          errors={errors}
          fieldConfig={FORM_CONFIG["images"].rules}
          onDataChange={onFieldDataChanged}
          groups={mediaFoldersOptions}
          fieldData={{
            limit: formData["limit"],
            group_id: formData["group_id"],
            fileExtensions: formData["fileExtensions"],
            fileExtensionsErrorMessage: formData["fileExtensionsErrorMessage"],
          }}
        />
      )}

      {(type === "text" || type === "textarea") && (
        <>
          <CharacterLimit
            type={type}
            isCharacterLimitEnabled={isCharacterLimitEnabled}
            onToggleCharacterLimitState={(enabled) =>
              setIsCharacterLimitEnabled(enabled)
            }
            onChange={onFieldDataChanged}
            minValue={formData["minCharLimit"] as number}
            maxValue={formData["maxCharLimit"] as number}
            errors={errors}
          />
          <Regex
            onChange={onFieldDataChanged}
            regexMatchPattern={formData["regexMatchPattern"] as string}
            regexMatchErrorMessage={
              formData["regexMatchErrorMessage"] as string
            }
            regexRestrictPattern={formData["regexRestrictPattern"] as string}
            regexRestrictErrorMessage={
              formData["regexRestrictErrorMessage"] as string
            }
            errors={errors}
          />
        </>
      )}

      {["number", "currency", "integration"].includes(type) && (
        <InputRange
          type={type as "number" | "currency" | "integration"}
          onChange={onFieldDataChanged}
          minValue={formData["minValue"] as number}
          maxValue={formData["maxValue"] as number}
          errors={errors}
          primaryText={type === "integration" ? "Limit Item Range" : null}
          secondaryText={
            type === "integration"
              ? "Set a minimum and/or maximum number of items"
              : null
          }
        />
      )}
    </Stack>
  );
};
