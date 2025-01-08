import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { LinkRounded } from "@mui/icons-material";

import { ActiveItem } from "./ActiveItem";
import {
  useGetContentModelQuery,
  useGetContentModelItemsQuery,
  useSearchContentQuery,
  useGetLangsQuery,
  useGetContentModelFieldsQuery,
} from "../../services/instance";

type RelationalFieldBaseProps = {
  value: string;
  relatedModelZUID: string;
  relatedFieldZUID: string;
  multiselect?: boolean;
};
export const RelationalFieldBase = ({
  value,
  relatedModelZUID,
  relatedFieldZUID,
  multiselect,
}: RelationalFieldBaseProps) => {
  const [langCode, setLangCode] = useState("");

  const { data: langs } = useGetLangsQuery({});
  const { data: modelData } = useGetContentModelQuery(relatedModelZUID, {
    skip: !relatedModelZUID,
  });
  const { data: contentItems } = useGetContentModelItemsQuery(
    {
      modelZUID: relatedModelZUID,
      params: {
        lang: langCode,
      },
    },
    { skip: !relatedModelZUID || !langCode }
  );
  const { data: modelFields } = useGetContentModelFieldsQuery(
    relatedModelZUID,
    { skip: !relatedModelZUID }
  );

  useEffect(() => {
    if (langs?.length) {
      setLangCode(langs?.find((lang) => lang.default)?.code);
    }
  }, [langs]);

  return (
    <Box component="section">
      <Stack gap={1}>
        {value?.split(",")?.map((val) => (
          <ActiveItem
            key={val}
            itemZUID={val}
            relatedModelData={modelData}
            relatedFieldData={modelFields?.find(
              (field) => field.ZUID === relatedFieldZUID
            )}
            draggable={multiselect}
          />
        ))}
      </Stack>
      {(multiselect || (!multiselect && !value?.split(",")?.length)) && (
        <Button
          variant="outlined"
          size="large"
          startIcon={<LinkRounded />}
          fullWidth
          sx={{
            mt: 1,
          }}
        >
          Add Existing {modelData?.label}
        </Button>
      )}
    </Box>
  );
};
