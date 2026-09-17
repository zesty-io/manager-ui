import { useState } from "react";
import { Box } from "@mui/material";
import { MemoizedEditor } from "./components/MemoizedEditor/MemoizedEditor";
import { TopBar } from "../TopBar";
import { LocalDirtyCodeModal } from "../LocalDirtyCodeModal";
import { useTranslation } from "react-i18next";
/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */

export const Editor = function Editor(props) {
  const { t } = useTranslation();
  const [code, setCode] = useState(props.code);
  return (
    <>
      <LocalDirtyCodeModal
        show={props.isDirty || code !== props?.code}
        title={t("common.unsavedChanges")}
        content={t("code.unsavedChangesDetail")}
        dirtyCodeFileType={props.fileType}
        dirtyCodeZuid={props.fileZUID}
        dirtyCodeStatus={props?.status}
        dirtyCodeCode={code}
      />
      <TopBar
        contentModelZUID={props.contentModelZUID}
        contentModelType={props.contentModelType}
        fileZUID={props.fileZUID}
        fileType={props.fileType}
        fileName={props.fileName}
        publishedVersion={props.publishedVersion}
        version={props.version}
        synced={props.synced}
        status={props.status}
        isLive={props.isLive}
        isDirty={props.isDirty}
        code={code}
        updatedAt={props.updatedAt}
        updatedBy={props.updatedBy}
        publishedAt={props.publishedAt}
        publishedBy={props.publishedBy}
        icon={props.icon}
        isDiffer={false}
      />

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "calc(100% - 64px)",
          flexGrow: 1,
          boxSizing: "border-box",
        }}
      >
        <MemoizedEditor
          dispatch={props.dispatch}
          code={code}
          setCode={setCode}
          fileName={props.fileName}
          fileZUID={props.fileZUID}
          contentModelZUID={props.contentModelZUID}
          fields={props.fields}
          status={props.status}
          lineNumber={props.lineNumber}
        />
      </Box>
    </>
  );
};
