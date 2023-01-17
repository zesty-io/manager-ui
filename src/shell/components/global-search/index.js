import { useDispatch } from "react-redux";
import { useRef } from "react";

import { useHistory } from "react-router-dom";

import ContentSearch from "shell/components/ContentSearch";
import { notify } from "shell/store/notifications";
import { theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";

export default function GlobalSearch() {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleSelect = (item) => {
    if (item?.meta) {
      history.push(`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`);
    } else {
      dispatch(
        notify({
          kind: "warn",
          message: "Selected item is missing meta data",
        })
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <ContentSearch
        placeholder="Search Instance"
        onSelect={handleSelect}
        value=""
      />
    </ThemeProvider>
  );
}
