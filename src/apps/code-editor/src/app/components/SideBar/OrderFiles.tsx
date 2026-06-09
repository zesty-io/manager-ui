import {
  useState,
  useEffect,
  cloneElement,
  Children,
  isValidElement,
  useRef,
} from "react";
import { connect, ConnectedProps } from "react-redux";
import {
  Link,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
  Alert,
  Button,
  IconButton,
} from "@mui/material";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import { resolvePathPart } from "../../../store/files";
import { fetchHeaders, saveSort } from "../../../store/headers";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

interface FileHeader {
  ZUID: string;
  fileName: string;
  sort: number;
}

interface OrderFilesProps extends ConnectedProps<typeof connector> {
  typePathPart: string;
  fileHeaders: FileHeader[];
  type: string;
  isOpen: boolean;
  onClose: () => void;
}

const Dropzone = (props: any) => {
  const [sourceIndex, setSourceIndex] = useState(null);
  const [children, setChildren] = useState(Children.toArray(props.children));

  useEffect(
    () => setChildren(Children.toArray(props.children)),
    [props.children]
  );
  const arrayMove = (array: any[], from: number, to: number) => {
    const arr = [...array];
    arr.splice(to < 0 ? arr.length + to : to, 0, arr.splice(from, 1)[0]);
    return arr;
  };

  // NOTE: this function seems uneccessary
  const onDragEnd = (evt: React.DragEvent<HTMLDivElement>) => {
    // Reset
    setSourceIndex(null);
    setChildren(Children.toArray(props.children));
  };

  const onDragEnter = (evt: React.DragEvent<HTMLDivElement>) => {
    // Required to make a drop zone
    evt.preventDefault();
  };

  const onDragOver = (evt: React.DragEvent<HTMLDivElement>) => {
    // Required to make drop zone
    evt.preventDefault();
  };

  const onOver = (index: number) => {
    setChildren(arrayMove(children, sourceIndex, index));
    setSourceIndex(index);
  };

  const onDrop = (evt: React.DragEvent<HTMLDivElement>) => {
    // Prevent page from unloading
    evt.preventDefault();

    if (props.onDrop) {
      props.onDrop(children);
    }
  };

  return (
    <div
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child as React.ReactElement<any>, {
            index,
            onOver,
            setSourceIndex,
          });
        }
        return child;
      })}
    </div>
  );
};

const Draggable = (props: any) => {
  const dragEl = useRef(null);
  return (
    <Box
      ref={dragEl}
      data-index={props.index}
      draggable={props.draggable}
      onDragOver={() => {
        // Communicate to the parent <DropZone> that the this child is being dragged over
        props.onOver(props.index);
      }}
      onDragStart={(evt) => {
        // Tell parent Dropzone which child is being dragged
        props.setSourceIndex(props.index);

        // Required in Firefox to initiate drag/drop
        evt.dataTransfer.setData(
          "text",
          JSON.stringify({
            index: props.index,
          })
        );

        evt.dataTransfer.dropEffect = "move";
      }}
    >
      {props.children}
    </Box>
  );
};

const mapStateToProps = (state: any, props: { type: string }) => {
  const typePathPart = resolvePathPart(props.type);

  const headersMap = state.headers
    .filter((header: any) => header.resourceZUID) // must have a resourceZUID
    .reduce((acc: Record<string, any>, header: any) => {
      acc[header.resourceZUID] = header;
      return acc;
    }, {}); // convert to map for easy lookups

  const files = state.files.filter((f: any) => {
    let filePathPart = resolvePathPart(f.type);
    return filePathPart === typePathPart && f.status === state.status.selected;
  });

  // Blend files and header data to create a data set and shape
  // need for the ordering experience
  const fileHeaders = files
    .map((file: any) => {
      const header = headersMap[file.ZUID];

      return {
        ZUID: file.ZUID,
        fileName: file.fileName,
        sort: header ? header.sort : 1,
      };
    })
    .sort((fileA: FileHeader, fileB: FileHeader) =>
      fileA.sort > fileB.sort ? 1 : -1
    );

  return {
    typePathPart,
    fileHeaders,
  };
};
const connector = connect(mapStateToProps);

const OrderFiles = (props: OrderFilesProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileHeader[]>(props.fileHeaders);

  const handleClose = () => {
    props?.onClose();
    setFiles(props.fileHeaders);
  };

  const handleReorder = (children: React.ReactNode[]) => {
    setFiles(
      children.map((child: any, i: number) => {
        return {
          ...child.props.file,
          sort: i + 1,
        };
      })
    );
  };

  const handleSaveSort = () => {
    setLoading(true);
    props
      .dispatch(saveSort(props.typePathPart, files) as any)
      .then(() => {
        return props.dispatch(fetchHeaders() as any);
      })
      .catch((err: any) => console.error("Error saving sort:", err))
      .finally(() => {
        props?.onClose();
        setLoading(false);
      });
  };
  useEffect(() => {
    if (loading) return;
    setFiles(props.fileHeaders);
  }, [props.fileHeaders, loading]);

  useEffect(() => {
    props.dispatch(fetchHeaders() as any);
  }, [Object.keys(props.fileHeaders).length]);

  return (
    <Dialog
      open={props?.isOpen}
      onClose={() => props?.onClose()}
      sx={{
        "& *, & *::before, & *::after": {
          boxSizing: "border-box",
        },
      }}
      PaperProps={{
        sx: {
          maxWidth: "540px",
          maxHeight: "80vh",
          overflowY: "auto",
          p: 0,
          boxSizing: "border-box",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: "20px",
          textTransform: "capitalize",
          borderBottom: "1px solid",
          borderColor: "border",
        }}
      >
        Order {props.typePathPart}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            m: 1,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          px: "20px",
          py: "20px",
          boxSizing: "border-box",
          backgroundColor: "grey.50",
        }}
      >
        <Typography variant="body2" mt={2} mb={3}>
          The displayed order is the order in which&nbsp;
          <Link
            href="https://zesty.org/services/web-engine/css-processing-flow"
            target="_blank"
            title="Learn More About Processing Flows"
          >
            &nbsp;files are processed and concatentated together
          </Link>
          &nbsp;into the dynamically created&nbsp;
          {props.typePathPart === "stylesheets" ? (
            <code>site.css</code>
          ) : (
            <code>site.js</code>
          )}
          &nbsp; file.
        </Typography>
        <Dropzone onDrop={handleReorder}>
          {files.map((file, index) => {
            return (
              <Draggable
                key={file.ZUID}
                draggable={true}
                file={file}
                index={index}
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  gap={1}
                  py={1}
                >
                  <Typography variant="body2">{`${Number(
                    file.sort
                  )})`}</Typography>

                  <ZoomOutMapIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.primary">
                    {file.fileName}
                  </Typography>
                </Box>
              </Draggable>
            );
          })}
        </Dropzone>
        <Alert severity="warning" sx={{ mt: 2 }}>
          After ordering a publish has to occur to process the new order and
          make the change live.
        </Alert>
      </DialogContent>
      <DialogActions
        sx={{ p: "20px", borderTop: "1px solid", borderColor: "border" }}
      >
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          {t("cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          variant="contained"
          data-cy="saveOrder"
          color="primary"
          onClick={handleSaveSort}
          loading={loading}
        >
          Save Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default connector(OrderFiles);
