import { FC, useCallback, Ref, useMemo } from "react";
import { TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import { TARGET_ERRORS } from "../constants";

type PathFieldProps = {
  id?: number;
  name?: string;
  value?: string;
  placeHolder?: string;
  prefix?: string;
  autoFocus?: boolean;
  inputRef?: Ref<any>;
  testId: string;
  onChange?: (value: string) => void;
  validation?: (value: string) => boolean;
};

const PathField: FC<PathFieldProps> = ({
  id,
  name,
  value = "",
  placeHolder,
  prefix = "",
  autoFocus = false,
  inputRef,
  testId,
  onChange,
  validation,
}) => {
  const isValid = useMemo(() => {
    if (!validation || !value) return true;
    return validation(value);
  }, [value, validation]);

  const handleUrlInput = useCallback(
    (event: any) => {
      const input = event.target as HTMLInputElement;
      let { data } = event;

      if (!data) return;
      data = data.replace(/ /g, "-").replace(/\s+/g, "");
      const allowedChars = /^[a-zA-Z0-9\-_.~&=/?:#\*]+$/;
      if (!allowedChars.test(data)) {
        event.preventDefault();
        return;
      }

      const { selectionStart = 0, selectionEnd = 0, value } = input;
      const updated =
        value.slice(0, selectionStart) + data + value.slice(selectionEnd);
      const prefixed =
        !!prefix && !updated.startsWith(prefix) ? prefix + updated : updated;

      input.value = prefixed;
      const newPos =
        selectionStart +
        data.length +
        (updated.startsWith(prefix) ? 0 : prefix?.length);
      input.setSelectionRange(newPos, newPos);

      event.preventDefault();
      onChange(prefixed);
    },
    [onChange]
  );

  return (
    <>
      <TextField
        data-cy={testId}
        inputRef={inputRef}
        size="small"
        fullWidth
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeHolder}
        onBeforeInput={handleUrlInput}
      />
      {!isValid && (
        <Typography
          data-cy="RedirectsPathFieldError"
          variant="body2"
          color="warning.dark"
          mt="4px"
          maxWidth="100%"
          overflow="hidden"
          noWrap={false}
          sx={{ wordWrap: "normal" }}
        >
          {TARGET_ERRORS.invalidUrl}
        </Typography>
      )}
    </>
  );
};

export default PathField;
