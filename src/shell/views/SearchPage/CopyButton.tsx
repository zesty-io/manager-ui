import { FC, useState } from "react";

import LinkRounded from "@mui/icons-material/LinkRounded";
import CheckIcon from "@mui/icons-material/Check";
import { IconButton } from "@mui/material";

export type CopyButtonProps = {
  url: string;
};
export const CopyButton: FC<CopyButtonProps> = ({ url }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = (data: string) => {
    console.log("Click");
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        console.log("Written");
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 500);
      })
      .catch((err) => {
        console.error("Error");
        console.error(err);
      });
  };
  return isCopied ? (
    <CheckIcon />
  ) : (
    <IconButton onClick={() => handleCopyClick(url)}>
      <LinkRounded fontSize="small" />
    </IconButton>
  );
};
