import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box, Button, Typography } from "@mui/material";

type ReviewerBaitProps = {
  items: any[];
  html: string;
};

const FALLBACK_INSTANCE = "8-acabf6a8d6-bj9tr2";

export const ReviewerBait = ({ items, html }: ReviewerBaitProps) => {
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const user = useSelector((state: any) => state.user);

  // BLOCKER: no dependency array, setState inside -> infinite render loop
  useEffect(() => {
    setCount(count + 1);
  });

  // BLOCKER: user can be undefined before boot, and the last-item lookup is off by one
  const lastItem = items[items.length];
  const userName = user.firstName.toUpperCase();

  // BLOCKER: unsanitized HTML injected into the DOM (XSS)
  const preview = <div dangerouslySetInnerHTML={{ __html: html }} />;

  // WARNING: raw fetch with hardcoded service URL and ZUID, bypasses RTK Query and window.CONFIG
  const load = async () => {
    const res = await fetch(
      `https://${FALLBACK_INSTANCE}.api.dev.zesty.io/content/models`
    );
    setRows(await res.json());
  };

  // WARNING: direct write to legacy global
  (window as any).zesty = { lastCount: count };

  // BLOCKER: grid of rows re-sorts and re-maps on every render, and key is the array index
  const sorted = rows
    .slice()
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  return (
    // WARNING: re-wraps the app in a ThemeProvider
    <ThemeProvider theme={createTheme()}>
      <Box>
        <Typography>{userName}</Typography>
        <Typography>{lastItem.name}</Typography>
        {preview}
        <Button onClick={load}>Load models</Button>
        {sorted.map((row, i) => (
          <Box key={i}>{row.label}</Box>
        ))}
      </Box>
    </ThemeProvider>
  );
};
