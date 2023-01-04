import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Box, ListItem, ListItemIcon, ListItemText } from "@mui/material";

import { ContentModelField } from "../../../../../shell/services/types";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import TitleRoundedIcon from "@mui/icons-material/TitleRounded";
import SubjectRoundedIcon from "@mui/icons-material/SubjectRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import DocumentScannerRoundedIcon from "@mui/icons-material/DocumentScannerRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AttachmentRoundedIcon from "@mui/icons-material/AttachmentRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PinRoundedIcon from "@mui/icons-material/PinRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import { Markdown, OneToOne } from "@zesty-io/material";

// TODO: Verify with Zosh the missing icons
const ICONS: { [key: string]: any } = {
  article_writer: {
    icon: <NewspaperRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  color: {
    icon: <ColorLensRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  currency: {
    icon: <PaymentsRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  date: {
    icon: <CalendarTodayRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  datetime: {
    icon: <ScheduleRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  dropdown: {
    icon: <KeyboardArrowDownRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  files: {
    icon: <AttachmentRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  fontawesome: {
    icon: "",
    backgroundColor: "",
    borderColor: "",
  },
  images: {
    icon: <AttachmentRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  internal_link: {
    icon: <DocumentScannerRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  link: {
    icon: <LinkRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  markdown: {
    icon: <Markdown />,
    backgroundColor: "",
    borderColor: "",
  },
  number: {
    icon: <PinRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  one_to_many: {
    icon: <AccountTreeRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  one_to_one: {
    icon: <OneToOne />,
    backgroundColor: "",
    borderColor: "",
  },
  sort: {
    icon: <FormatListNumberedRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  text: {
    icon: <TitleRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  textarea: {
    icon: <SubjectRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  uuid: {
    icon: "",
    backgroundColor: "",
    borderColor: "",
  },
  wysiwyg_advanced: {
    icon: <NewspaperRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  wysiwyg_basic: {
    icon: <NewspaperRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
  yes_no: {
    icon: <ToggleOnRoundedIcon />,
    backgroundColor: "",
    borderColor: "",
  },
};

const generateIcon = (type: string) => {
  return ICONS[type].icon;
};

interface Props {
  field: ContentModelField;
  index: number;
  onReorder: () => void;
  setDraggedIndex: (index: number) => void;
  setHoveredIndex: (index: number) => void;
}

export const Field = ({
  field,
  onReorder,
  index,
  setDraggedIndex,
  setHoveredIndex,
}: Props) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const handleDragStart = (e: React.DragEvent) => {
    // console.log('testing', e, e.target, e.currentTarget);
    // e.preventDefault();
    // return;
    // firefox requires this event, it does nothing
    //event.dataTransfer.setData("text", "");
    setIsDragging(true);
    setDraggedIndex(index);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onReorder();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    setHoveredIndex(index);
  };

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      minHeight="62px"
      border="1px solid black"
      ref={ref}
      sx={style}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnter={handleDragEnter}
      onDragEnd={handleDragEnd}
    >
      <DragIndicatorRoundedIcon
        onMouseEnter={() => setIsDraggable(true)}
        onMouseLeave={() => setIsDraggable(false)}
        sx={{ cursor: "grab" }}
      />
      {/* <ListItem>
        <ListItemIcon sx={{
          minWidth: '36px',
        }}>
          <PublicRoundedIcon />
        </ListItemIcon>
        <ListItemText>{field.name}</ListItemText>
      </ListItem> */}
      {ICONS[field.datatype].icon}
      {field.name} - {field.datatype}
    </Box>
  );
};
