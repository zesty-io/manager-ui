import { Box, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useLocalStorage } from "react-use";
import { useTranslation } from "react-i18next";

import zestyLogoPulse from "../../../../public/images/zestyLogoOnlyPulsate.svg";
import contentOneLogoOnly from "../../../../public/images/contentOneLogoOnly.webp";
import { isContentOne } from "../../../utility/isContentOne";

const QUOTE: Quote = window.randomQuote;

type Quote = {
  quote: string;
  quotee: string;
};
type LoadingQuoteProps = {
  loadNewQuote?: boolean;
};
export const LoadingQuote = ({ loadNewQuote }: LoadingQuoteProps) => {
  const { t } = useTranslation();
  const [LocalStorageQuotes] = useLocalStorage<Quote[]>("zesty:quotes", []);

  const randomQuote = useMemo(() => {
    // Makes sure that the quote is only randomized if we specifically tell it to
    // otherwise it will use the QUOTE from window object
    // which makes sure the quote is the same across all loading screens
    if (loadNewQuote || !QUOTE) {
      return !!LocalStorageQuotes?.length
        ? LocalStorageQuotes[
            Math.floor(Math.random() * LocalStorageQuotes.length)
          ]
        : {
            quote: "Content is king.",
            quotee: "Bill Gates",
          };
    } else {
      return QUOTE;
    }
  }, [loadNewQuote, QUOTE, LocalStorageQuotes]);

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
      textAlign="center"
    >
      <Box
        component="img"
        src={isContentOne() ? contentOneLogoOnly : zestyLogoPulse}
        loading="lazy"
        alt={t("shell.loadingLogoAlt")}
        sx={{
          width: 100,
          height: 100,
          mb: 4,
        }}
      />
      <Typography
        variant="h3"
        sx={{ mb: 1.5, maxWidth: 640 }}
        color="text.primary"
      >
        "{randomQuote.quote}"
      </Typography>
      <Typography variant="h5" color="text.primary">
        — {randomQuote.quotee}
      </Typography>
    </Stack>
  );
};
