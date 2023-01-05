import { SvgIconComponent } from "@mui/icons-material";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import TitleRounded from "@mui/icons-material/TitleRounded";
import SubjectRounded from "@mui/icons-material/SubjectRounded";
import NewspaperRounded from "@mui/icons-material/NewspaperRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import DocumentScannerRounded from "@mui/icons-material/DocumentScannerRounded";
import AccountTreeRounded from "@mui/icons-material/AccountTreeRounded";
import AttachmentRounded from "@mui/icons-material/AttachmentRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import CalendarTodayRounded from "@mui/icons-material/CalendarTodayRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import PinRounded from "@mui/icons-material/PinRounded";
import TagRounded from "@mui/icons-material/TagRounded";
import ToggleOnRounded from "@mui/icons-material/ToggleOnRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ColorLensRounded from "@mui/icons-material/ColorLensRounded";
import FormatListNumberedRounded from "@mui/icons-material/FormatListNumberedRounded";
import { Markdown, OneToOne } from "@zesty-io/material";
import { Box } from "@mui/system";
import { SvgIcon } from "@mui/material";

/**
 * TODO: Update icons for the ff once Zosh provides the correct icons:
 * - UUID
 * - WYSIWYG
 * - Article Writer
 */
type Icons = {
  [key: string]: {
    icon: SvgIconComponent;
    backgroundColor: string;
    borderColor: string;
  };
};
const icons: Icons = {
  article_writer: {
    icon: NewspaperRounded,
    backgroundColor: "green.50",
    borderColor: "green.500",
  },
  color: {
    icon: ColorLensRounded,
    backgroundColor: "purple.50",
    borderColor: "purple.700",
  },
  currency: {
    icon: PaymentsRounded,
    backgroundColor: "purple.50",
    borderColor: "purple.700",
  },
  date: {
    icon: CalendarTodayRounded,
    backgroundColor: "deepOrange.50",
    borderColor: "deepOrange.500",
  },
  datetime: {
    icon: ScheduleRounded,
    backgroundColor: "deepOrange.50",
    borderColor: "deepOrange.500",
  },
  dropdown: {
    icon: KeyboardArrowDownRounded,
    backgroundColor: "purple.50",
    borderColor: "purple.700",
  },
  images: {
    icon: AttachmentRounded,
    backgroundColor: "blue.50",
    borderColor: "blue.500",
  },
  internal_link: {
    icon: DocumentScannerRounded,
    backgroundColor: "pink.50",
    borderColor: "pink.600",
  },
  link: {
    icon: LinkRounded,
    backgroundColor: "pink.50",
    borderColor: "pink.600",
  },
  markdown: {
    icon: Markdown as SvgIconComponent,
    backgroundColor: "green.50",
    borderColor: "green.500",
  },
  number: {
    icon: PinRounded,
    backgroundColor: "red.50",
    borderColor: "red.600",
  },
  one_to_many: {
    icon: AccountTreeRounded,
    backgroundColor: "pink.50",
    borderColor: "pink.600",
  },
  one_to_one: {
    icon: OneToOne as SvgIconComponent,
    backgroundColor: "pink.50",
    borderColor: "pink.600",
  },
  sort: {
    icon: FormatListNumberedRounded,
    backgroundColor: "purple.50",
    borderColor: "purple.700",
  },
  text: {
    icon: TitleRounded,
    backgroundColor: "green.50",
    borderColor: "green.600",
  },
  textarea: {
    icon: SubjectRounded,
    backgroundColor: "green.50",
    borderColor: "green.600",
  },
  uuid: {
    icon: PublicRoundedIcon,
    backgroundColor: "purple.50",
    borderColor: "purple.700",
  },
  wysiwyg_basic: {
    icon: NewspaperRounded,
    backgroundColor: "green.50",
    borderColor: "green.500",
  },
  yes_no: {
    icon: ToggleOnRounded,
    backgroundColor: "purple.50",
    borderColor: "purple.700",
  },
};

export const generateIcon = (type: string) => {
  const icon = icons[type].icon;
  const borderColor = icons[type].borderColor;
  const bgcolor = icons[type].backgroundColor;
  const transform =
    type === "files" || type === "images" ? "rotate(-45deg)" : "";

  return (
    <Box
      border="1px solid red"
      borderColor={borderColor}
      borderRadius={1}
      bgcolor={bgcolor}
      color={borderColor}
      width="24px"
      height="24px"
      fontSize="12px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <SvgIcon
        component={icon}
        fontSize="inherit"
        sx={{
          verticalAlign: "middle",
          transform,
          textAlign: "center",
        }}
      />
    </Box>
  );
};
