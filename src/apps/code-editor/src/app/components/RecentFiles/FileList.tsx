import { ElementType, FC, useEffect, useState } from "react";
import { Paper, Box, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import moment from "moment";

import { NoResults } from "../../../../../schema/src/app/components/NoResults";
import { FileTypes } from "../constants";

export type FileRowItemProps = {
  icon?: ElementType | null;
  fileName: string;
  lastSaved: string;
  path?: string | null;
  end?: boolean;
};

export type FileProps = {
  icon?: ElementType | null;
  fileName: string;
  lastSaved: string;
  path?: string | null;
  ZUID?: string;
  fileType?: string;
  type?: FileTypes;
  end?: boolean;
};

export type FileListProps = {
  files: FileProps[];
  searchKeyword?: string | null;
  searchInputRef?: React.RefObject<HTMLInputElement> | null;
  setSearchKeyword?: (text: string) => void;
};

const FileRowItem = ({
  icon = null,
  fileName,
  lastSaved,
  path = null,
  end = false,
}: FileProps) => {
  return (
    <Box
      component={path ? Link : "div"}
      {...(path && { to: path })}
      px="16px"
      width="100%"
      height="56px"
      display="flex"
      alignItems="center"
      sx={{
        ...(!end && { borderBottom: "1px solid", borderColor: "grey.700" }),
        textDecoration: "none",
        color: "grey.500",
        "&:hover": {
          backgroundColor: "grey.900",
        },
      }}
    >
      <Grid container spacing={0}>
        <Grid item xs={8} display="flex" alignItems="center" columnGap="12px">
          {!icon ? null : (
            <Box
              component={icon}
              sx={{
                width: "20px",
                height: "20px",
                "& svg": { color: "grey.500" },
              }}
            />
          )}
          <Typography
            variant="body1"
            color="common.white"
            sx={{
              textDecoration: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              pr: "20px",
            }}
          >
            {fileName}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography
            variant="body1"
            color="common.white"
            sx={{
              textDecoration: "none",
            }}
          >
            {moment(lastSaved).fromNow()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export const FileList: FC<FileListProps> = ({
  files,
  searchKeyword = null,
  searchInputRef = null,
  setSearchKeyword = null,
}) => {
  const [filteredFiles, setFilteredFiles] = useState([]);

  const handleSearchAgainClicked = () => {
    setSearchKeyword?.("");
    searchInputRef?.current?.focus();
  };

  useEffect(() => {
    if (!files?.length) return;

    const filteredFiles = !searchKeyword
      ? files
      : files?.filter((item: FileProps) => {
          const searchString =
            `${item?.fileName}\n${item?.path}\n${item?.ZUID}\n${item?.fileType}\n${item?.type}`
              ?.toLowerCase()
              ?.trim();
          return searchString
            ?.toLowerCase()
            ?.includes(searchKeyword?.toLowerCase());
        });
    setFilteredFiles(filteredFiles);
  }, [files, searchKeyword]);

  return (
    <Paper
      variant="outlined"
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
        color: "grey.400",
        borderColor: "grey.700",
        borderRadius: "8px",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        pl="16px"
        pr="24px"
        width="100%"
        height="56px"
        display="flex"
        alignItems="center"
        sx={{
          borderBottom: "1px solid",
          borderColor: "grey.700",
        }}
      >
        <Grid container spacing={0}>
          <Grid item xs={8}>
            <Typography variant="h6" fontWeight={700} color="common.white">
              File Name
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" fontWeight={700} color="common.white">
              Last Saved
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box height="calc(100% - 56px)" overflow="auto">
        {!!filteredFiles?.length ? (
          filteredFiles?.map((file, index) => (
            <FileRowItem
              key={file.path}
              icon={file.icon}
              fileName={file.fileName}
              lastSaved={file.lastSaved}
              path={file.path}
              end={index === files.length - 1}
            />
          ))
        ) : (
          <Box
            sx={{
              display: "grid",
              placeContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <NoResults
              type="search"
              onButtonClick={handleSearchAgainClicked}
              searchTerm={searchKeyword}
              sx={{
                "& img": { height: "200px", width: "220px" },
                "& h4.MuiTypography-root": {
                  color: "common.white",
                },
                "& p.MuiTypography-root": {
                  color: "grey.200",
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};
