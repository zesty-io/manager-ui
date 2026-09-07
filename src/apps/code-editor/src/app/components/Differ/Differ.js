import { memo, useState } from "react";
import { MonacoDiffEditor } from "react-monaco-editor";
import { useTranslation } from "react-i18next";

import { resolveMonacoLang } from "../../../store/files";

import { WithLoader } from "shell/components/legacy/WithLoader";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
import { Box } from "@mui/material";
import { TopBar } from "../TopBar";

export const Differ = memo(
  function Differ(props) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [versionCodeLeft, setVersionCodeLeft] = useState(
      props.currentCode || ""
    );
    const [versionCodeRight, setVersionCodeRight] = useState(
      props.versionCode || ""
    );

    return (
      <>
        <TopBar
          contentModelZUID={props?.contentModelZUID}
          contentModelType={props?.contentModelType}
          fileZUID={props?.fileZUID}
          fileType={props?.fileType}
          fileName={props?.fileName}
          status={props.status}
          dispatch={props?.dispatch}
          publishedVersion={props?.publishedVersion}
          setVersionCodeLeft={setVersionCodeLeft}
          setVersionCodeRight={setVersionCodeRight}
          setLoading={setLoading}
          isLoading={loading}
          synced={props?.synced}
          code={props?.currentCode}
          icon={props.icon}
          isDiffer={true}
        />
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "calc(100% - 64px)",
            flexGrow: 1,
            boxSizing: "border-box",
            zIndex: 0,
          }}
        >
          <WithLoader
            condition={!loading}
            message={t("code.findingFileVersions")}
          >
            <MonacoDiffEditor
              theme="vs-dark"
              width="100%"
              original={versionCodeLeft}
              value={versionCodeRight}
              language={resolveMonacoLang(props?.fileName)}
              options={{
                selectOnLineNumbers: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: {
                  top: 10,
                  bottom: 10,
                },
              }}
            />
          </WithLoader>
        </Box>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if open fileZUID changed
    if (prevProps.fileZUID !== nextProps.fileZUID) {
      return false;
    }

    return true;
  }
);
