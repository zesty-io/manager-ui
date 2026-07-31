import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";

import { AppState } from "../../../../../../../../shell/store/types";
import {
  searchItems,
  fetchItem,
} from "../../../../../../../../shell/store/content";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelsQuery,
} from "../../../../../../../../shell/services/instance";
import SearchField from "../../../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/SearchField";
import { FieldWrapper } from "../../../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/FieldWrapper";
import { ContentItemProps } from "../../../../../../../seo/src/app/components/RedirectsDialogProvider/constants";
import { ConnectField } from "../../hooks/studioTypes";
import {
  isMediaSlotDatatype,
  isTextReferenceableDatatype,
} from "./studioFieldMeta";
import { FieldIconChip } from "./FieldIconChip";

// One field row — used BOTH for the dropdown options and for the Select's
// chosen value, so the two can't drift.
const FieldOptionRow = ({
  field,
}: {
  field: { name: string; label?: string; datatype: string };
}) => (
  <Stack direction="row" alignItems="center" gap={1.5} minWidth={0}>
    <FieldIconChip datatype={field.datatype} />
    <Typography variant="body2" color="text.primary" noWrap>
      {field.label || field.name}
    </Typography>
  </Stack>
);

type StudioLinkItemDialogProps = {
  // The caller mounts this only while open, so state resets on close for free.
  open: boolean;
  // Which of the other item's fields this slot may bind. The SAME predicates
  // used for the current item's dropdown, applied to the other model.
  fieldFilter: "text" | "media";
  onClose: () => void;
  // Always called with `source` populated.
  onConfirm: (field: ConnectField) => void;
};

export const StudioLinkItemDialog = ({
  open,
  fieldFilter,
  onClose,
  onConfirm,
}: StudioLinkItemDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [item, setItem] = useState<ContentItemProps | null>(null);
  const [fieldName, setFieldName] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const contentItems = useSelector((state: AppState) => state.content);
  const languages = useSelector((state: AppState) => state.languages);
  const { data: models } = useGetContentModelsQuery();

  // Options come out of the redux content cache rather than the search
  // response, because `searchItems` merges every hit into state.content — which
  // is also what makes the item's `data` available for the live preview later.
  const options = useMemo<ContentItemProps[]>(() => {
    return Object.values(contentItems)
      .filter(
        (entry: any) => entry?.meta?.ZUID && !entry.meta.ZUID.includes("new")
      )
      .sort(
        (a: any, b: any) =>
          new Date(b?.meta?.createdAt).getTime() -
          new Date(a?.meta?.createdAt).getTime()
      )
      .map((entry: any) => ({
        ZUID: entry.meta.ZUID,
        label:
          entry.web?.metaTitle ||
          entry.web?.metaLinkText ||
          entry.web?.path ||
          entry.meta.ZUID,
        // Dataset items have no route, so this is legitimately empty for them.
        path: entry.web?.path || "",
        langCode:
          languages?.find((lang: any) => lang.ID === entry.meta?.langID)
            ?.code || "en-US",
        type: models?.find((m) => m.ZUID === entry.meta?.contentModelZUID)
          ?.type,
        isPublished: entry.publishing?.isPublished || false,
      }));
  }, [contentItems, languages, models]);

  const modelZUID = item?.ZUID
    ? (contentItems as any)[item.ZUID]?.meta?.contentModelZUID
    : undefined;
  const model = useMemo(
    () => models?.find((m) => m.ZUID === modelZUID),
    [models, modelZUID]
  );

  const { data: fields, isFetching: isFetchingFields } =
    useGetContentModelFieldsQuery({ modelZUID }, { skip: !modelZUID });

  // getContentModelFields defaults to showDeleted: true, so the deletedAt
  // filter is required — not defensive.
  const fieldOptions = useMemo(
    () =>
      (fields ?? []).filter(
        (field) =>
          !field.deletedAt &&
          (fieldFilter === "media"
            ? isMediaSlotDatatype(field.datatype)
            : isTextReferenceableDatatype(field.datatype))
      ),
    [fields, fieldFilter]
  );

  const handleSearch = (term: string) => {
    setIsSearching(true);
    Promise.resolve(dispatch(searchItems(term) as any)).finally(() =>
      setIsSearching(false)
    );
  };

  const handleItemChange = (next: ContentItemProps | null) => {
    setItem(next);
    // The field list is per-model, so a previously picked field is meaningless
    // once the item changes.
    setFieldName("");

    // Search results carry `data`, but an item that reached the store some other
    // way may not. Pull it now so the live preview can resolve on confirm.
    const nextModelZUID = next?.ZUID
      ? (contentItems as any)[next.ZUID]?.meta?.contentModelZUID
      : undefined;
    if (
      next?.ZUID &&
      nextModelZUID &&
      !(contentItems as any)[next.ZUID]?.data
    ) {
      dispatch(fetchItem(nextModelZUID, next.ZUID) as any);
    }
  };

  const selectedField = fieldOptions.find((f) => f.name === fieldName);
  const canConfirm = Boolean(
    item?.ZUID && selectedField && model?.name && model?.ZUID
  );

  const handleConfirm = () => {
    if (!canConfirm || !selectedField || !model || !item) return;
    onConfirm({
      name: selectedField.name,
      label: selectedField.label || selectedField.name,
      datatype: selectedField.datatype,
      source: {
        modelName: model.name,
        modelZUID: model.ZUID,
        itemZUID: item.ZUID,
        modelLabel: model.label,
        itemLabel: item.label,
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-cy="StudioLinkItemDialog"
      PaperProps={{
        sx: { width: 640, maxWidth: "90vw", borderRadius: 2 },
      }}
    >
      {/* Section padding is a uniform 20px from the Figma (Header/Content/Footer
          all inset the same). Only the FOOTER carries a top border there, so
          DialogContent deliberately doesn't use `dividers` — that would draw a
          second line under the header and swap the padding to MUI's 16px/24px. */}
      <DialogTitle component="div" sx={{ p: 2.5, pr: 6 }}>
        <Typography variant="h6" fontWeight={600}>
          {t("content.studioLinkItemDialogTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("content.studioLinkItemDialogSubtitle")}
        </Typography>
        <IconButton
          data-cy="StudioLinkItemDialogClose"
          aria-label={t("content.studioLinkItemDialogCloseAriaLabel")}
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      {/* The 20px lives on the inner Stack, not on DialogContent. MUI ships
          `.MuiDialogTitle-root + .MuiDialogContent-root { padding-top: 0 }`,
          and that adjacent-sibling selector outranks an sx class — so padding
          set here applies on three sides and is silently dropped on top. */}
      <DialogContent sx={{ p: 0, bgcolor: (theme) => theme.palette.grey[50] }}>
        <Stack gap={2.5} p={2.5}>
          <FieldWrapper
            label={t("content.studioLinkItemContentItemLabel")}
            tooltip={t("content.studioLinkItemContentItemTooltip")}
          >
            <SearchField
              options={options}
              loading={isSearching}
              value={item}
              onChange={handleItemChange}
              onSearch={handleSearch}
              dataCy="StudioLinkItemSearch"
              hideUnpublishedWarning
            />
          </FieldWrapper>

          {item ? (
            <FieldWrapper
              label={t("content.studioLinkItemFieldLabel")}
              tooltip={t("content.studioLinkItemFieldTooltip")}
            >
              {!isFetchingFields && fieldOptions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("content.studioLinkItemNoLinkableFields")}
                </Typography>
              ) : (
                <TextField
                  select
                  fullWidth
                  value={fieldName}
                  disabled={isFetchingFields}
                  onChange={(evt) => setFieldName(evt.target.value)}
                  inputProps={{ "data-cy": "StudioLinkItemFieldSelect" }}
                  SelectProps={{
                    // The Select clones the chosen MenuItem's CHILDREN into its
                    // value container, not the MenuItem itself — so the row's
                    // own flex/gap never applies there and the chip and label
                    // stack. Render the value explicitly instead.
                    renderValue: (selected) => {
                      const picked = fieldOptions.find(
                        (field) => field.name === selected
                      );
                      if (!picked) return null;
                      return <FieldOptionRow field={picked} />;
                    },
                  }}
                >
                  {fieldOptions.map((field) => (
                    <MenuItem
                      key={field.name}
                      value={field.name}
                      data-cy={`StudioLinkItemField-${field.name}`}
                    >
                      <FieldOptionRow field={field} />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </FieldWrapper>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          justifyContent: "space-between",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          data-cy="StudioLinkItemCancel"
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="StudioLinkItemConfirm"
          variant="contained"
          color="primary"
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {t("content.studioLinkItemConfirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
