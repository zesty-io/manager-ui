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

  if (type === "uuid") {
    return <ComingSoon />;
  }

  return (
    <Stack gap={2.5}>
      {type === "images" && (
        <MediaRules
          fieldConfig={FORM_CONFIG["images"].rules}
          onDataChange={onFieldDataChanged}
          groups={mediaFoldersOptions}
          fieldData={{
            limit: formData["limit"],
            group_id: formData["group_id"],
          }}
        />
      )}

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
      />

      {(type === "text" || type === "textarea") && (
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
      )}
    </Stack>
  );
};
