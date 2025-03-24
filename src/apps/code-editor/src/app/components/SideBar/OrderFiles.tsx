import {
  useState,
  useEffect,
  cloneElement,
  Children,
  isValidElement,
  useRef,
} from "react";
import { connect, ConnectedProps } from "react-redux";
import SaveIcon from "@mui/icons-material/Save";
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
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import { faExpandArrowsAlt } from "@fortawesome/free-solid-svg-icons";
import { resolvePathPart } from "../../../store/files";
import { fetchHeaders, saveSort } from "../../../store/headers";
import { LoadingButton } from "@mui/lab";

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
          return cloneElement(child, {
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
    <div
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
    </div>
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
      disablePortal
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
      <DialogTitle sx={{ px: 4, pt: 3 }}>
        Order {props.typePathPart}
      </DialogTitle>
      <DialogContent
        sx={{
          px: 4,
          py: 0,
          boxSizing: "border-box",
          backgroundColor: "grey.100",
        }}
      >
        <Typography variant="body2" mt={2} mb={3}>
          The displayed order is the order in which
          <Link
            href="https://zesty.org/services/web-engine/css-processing-flow"
            target="_blank"
            title="Learn More About Processing Flows"
          >
            files are processed and concatentated together
          </Link>
          into the dynamically created
          {props.typePathPart === "stylesheets" ? (
            <code>site.css</code>
          ) : (
            <code>site.js</code>
          )}
          file.
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
                  <FontAwesomeIcon
                    size="sm"
                    color="grey.500"
                    icon={faExpandArrowsAlt}
                  />
                  <Typography variant="body2">{file.fileName}</Typography>
                </Box>
              </Draggable>
            );
          })}
        </Dropzone>
        <Alert severity="warning" sx={{ my: 2 }}>
          After ordering a publish has to occur to process the new order and
          make the change live.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ pt: 2, px: 4 }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={handleClose}
          startIcon={<DoDisturbAltIcon />}
        >
          Cancel (ESC)
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          data-cy="saveOrder"
          color="primary"
          onClick={handleSaveSort}
          loadingPosition="start"
          loading={loading}
          startIcon={<SaveIcon />}
        >
          Save Order
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default connector(OrderFiles);
