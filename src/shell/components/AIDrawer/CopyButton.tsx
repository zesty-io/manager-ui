import { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import { CheckRounded, ContentCopyRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

type CopyButtonProps = {
  text: string;
};

// Copies the raw source as plain text.
export const CopyButton = ({ text }: CopyButtonProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch (err) {
      console.error(err);
      setStatus("failed");
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <Button
      data-cy="AIDrawerCopy"
      variant="outlined"
      color={status === "failed" ? "error" : "primary"}
      onClick={handleCopy}
      startIcon={
        status === "copied" ? (
          <CheckRounded fontSize="small" />
        ) : (
          <ContentCopyRounded fontSize="small" />
        )
      }
    >
      {status === "copied"
        ? t("shell.aiCopied")
        : status === "failed"
        ? t("shell.aiCopyFailed")
        : t("common.copy")}
    </Button>
  );
};
