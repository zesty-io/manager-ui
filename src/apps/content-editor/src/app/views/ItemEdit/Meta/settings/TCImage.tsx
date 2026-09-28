import { useState, useMemo } from "react";
import { MemoryRouter } from "react-router";
import { Box, Dialog } from "@mui/material";
import { IconButton } from "@zesty-io/material";
import { Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { FieldTypeMedia } from "../../../../components/FieldTypeMedia";
import { MediaApp } from "../../../../../../../media/src/app";
import { ContentModelField } from "../../../../../../../../shell/services/types";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { hasErrors } from "./util";

type TCImageProps = {
  field: ContentModelField;
  error: Error;
  onChange: (value: string, name: string) => void;
  value: string;
};
export const TCImage = ({ field, error, onChange, value }: TCImageProps) => {
  const { t } = useTranslation();
  const [imageModal, setImageModal] = useState(null);

  const imagesArray = useMemo(() => {
    if (!value) return [];

    return ((value as string) || "").split(",").filter((el: string) => el);
  }, [value]);

  return (
    <Box id={field.ZUID}>
      <FieldShell
        settings={{
          label: field?.label,
          required: field?.required,
        }}
        withInteractiveTooltip={false}
        errors={error ?? {}}
      >
        <FieldTypeMedia
          hasError={hasErrors(error)}
          limit={1}
          images={imagesArray}
          openMediaBrowser={(opts: any) => {
            setImageModal({
              ...opts,
              locked: Boolean(
                field?.settings &&
                  field?.settings.group_id &&
                  field?.settings.group_id != "0"
              ),
            });
          }}
          settings={{
            fileExtensions: [
              ".png",
              ".jpg",
              ".jpeg",
              ".svg",
              ".gif",
              ".tif",
              ".webp",
              ".avif",
            ],
            fileExtensionsErrorMessage: t(
              "content.itemEditMetaImageFileExtensionsError"
            ),
          }}
          name={field?.name}
          onChange={onChange}
          lockedToGroupId={
            field?.settings?.group_id && field?.settings?.group_id !== "0"
              ? field?.settings.group_id
              : null
          }
        />
      </FieldShell>
      {imageModal && (
        <MemoryRouter initialEntries={["/media?filetype=Image"]}>
          <Dialog
            open
            fullScreen
            sx={{ my: 2.5, mx: 10 }}
            PaperProps={{
              style: {
                borderRadius: "4px",
                overflow: "hidden",
              },
            }}
            onClose={() => setImageModal(null)}
          >
            <IconButton
              sx={{
                position: "fixed",
                right: 5,
                top: 0,
              }}
              onClick={() => setImageModal(null)}
            >
              <Close sx={{ color: "common.white" }} />
            </IconButton>
            <MediaApp
              limitSelected={1}
              isSelectDialog={true}
              showHeaderActions={false}
              lockedToGroupId={
                field?.settings?.group_id && field?.settings?.group_id !== "0"
                  ? field?.settings.group_id
                  : null
              }
              addImagesCallback={(images) => {
                imageModal.callback(images);
                setImageModal(null);
              }}
              isReplace={imageModal.isReplace}
            />
          </Dialog>
        </MemoryRouter>
      )}
    </Box>
  );
};
