import { useState } from "react";
import {
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Tooltip,
  Link,
} from "@mui/material";
import { Database } from "@zesty-io/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckIcon from "@mui/icons-material/Check";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ContentModelField } from "../../../../../../../shell/services/types";
import { FieldIcon } from "../../../../../../schema/src/app/components/Field/FieldIcon";
import {
  getTypeText,
  FieldType,
} from "../../../../../../schema/src/app/components/configs";
import { formatLocalized } from "shell/i18n/dates";

type FieldTooltipBodyProps = {
  data: Partial<ContentModelField>;
};
export const FieldTooltipBody = ({ data }: FieldTooltipBodyProps) => {
  const { t } = useTranslation(["content", "schema"]);
  const TYPE_TEXT = getTypeText(t);
  const history = useHistory();

  return (
    <>
      <Stack
        p={1.25}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        borderRadius="inherit"
        sx={{
          backgroundColor: "grey.50",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <FieldIcon type={data?.datatype} />
          <Stack>
            <Typography variant="body2" fontWeight={600} noWrap maxWidth={200}>
              {data?.label} {data?.required && "*"}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {t("content.fieldTypeLabel", {
                type: TYPE_TEXT[data?.datatype as FieldType],
              })}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="inherit"
          size="small"
          startIcon={<Database color="action" />}
          onClick={() =>
            history.push(
              `/schema/${data?.contentModelZUID}/fields/${data?.ZUID}`
            )
          }
          sx={{
            flexShrink: 0,
          }}
        >
          {t("content.editFieldButton")}
        </Button>
      </Stack>
      <Stack gap={2.5} p={1.5}>
        <CopyField
          value={data?.name}
          title={t("content.apiCodeIdLabel")}
          tooltip={t("content.apiCodeIdTooltip")}
        />
        <CopyField
          value={data?.ZUID}
          title={t("content.fieldZuidLabel")}
          tooltip={t("content.fieldZuidTooltip")}
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body3" fontWeight={600} color="text.secondary">
            {t("content.fieldAddedOnLabel")}{" "}
            {data?.createdAt
              ? formatLocalized(new Date(data.createdAt), "MMM d, yyyy")
              : ""}
          </Typography>
          <Link
            component={RouterLink}
            to={`/schema/${data?.contentModelZUID}/activity-log`}
            color="text.secondary"
            underline="always"
            variant="body3"
            fontWeight={600}
            sx={{
              textDecorationColor: "#475467",

              "&:hover": {
                textDecorationColor: "#475467",
              },
            }}
          >
            {t("content.viewModelActivityLog")}
          </Link>
        </Stack>
      </Stack>
    </>
  );
};

type CopyFieldProps = {
  value: string;
  title: string;
  tooltip?: string;
};
const CopyField = ({ value, title, tooltip }: CopyFieldProps) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Stack gap={0.5}>
      <Stack direction="row" gap={1} alignItems="center">
        <Typography variant="body2">{title}</Typography>
        <Tooltip title={tooltip} placement="top">
          <InfoRoundedIcon color="action" sx={{ fontSize: 12 }} />
        </Tooltip>
      </Stack>
      <TextField
        disabled
        value={value}
        inputProps={{
          sx: {
            ":read-only": {
              textFillColor: "#101828",
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  navigator?.clipboard
                    ?.writeText(value)
                    .then(() => {
                      setIsCopied(true);
                      setTimeout(() => {
                        setIsCopied(false);
                      }, 3000);
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                }}
              >
                {isCopied ? (
                  <CheckIcon color="action" />
                ) : (
                  <ContentCopyRoundedIcon color="action" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
};
