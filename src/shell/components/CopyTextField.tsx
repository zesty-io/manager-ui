import { theme } from "@zesty-io/material";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Check, ContentCopyRounded } from "@mui/icons-material";
import { useState } from "react";

type CopyTextFieldProps = {
  value: string;
};
export const CopyTextField = ({ value }: CopyTextFieldProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
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
  };

  return (
    <TextField
      disabled
      value={value}
      size="small"
      fullWidth
      inputProps={{
        sx: {
          ":read-only": {
            textFillColor: theme.palette.text.primary,
          },
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleCopyClick}>
              {isCopied ? (
                <Check color="action" />
              ) : (
                <ContentCopyRounded color="action" />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
