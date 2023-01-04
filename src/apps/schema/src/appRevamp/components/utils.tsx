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

// TODO: Verify with Zosh the missing icons
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
    backgroundColor: "",
    borderColor: "",
  },
  color: {
    icon: ColorLensRounded,
    backgroundColor: "",
    borderColor: "",
  },
  currency: {
    icon: PaymentsRounded,
    backgroundColor: "",
    borderColor: "",
  },
  date: {
    icon: CalendarTodayRounded,
    backgroundColor: "",
    borderColor: "",
  },
  datetime: {
    icon: ScheduleRounded,
    backgroundColor: "",
    borderColor: "",
  },
  dropdown: {
    icon: KeyboardArrowDownRounded,
    backgroundColor: "",
    borderColor: "",
  },
  files: {
    icon: AttachmentRounded,
    backgroundColor: "",
    borderColor: "",
  },
  fontawesome: {
    icon: PublicRoundedIcon,
    backgroundColor: "",
    borderColor: "",
  },
  images: {
    icon: AttachmentRounded,
    backgroundColor: "",
    borderColor: "",
  },
  internal_link: {
    icon: DocumentScannerRounded,
    backgroundColor: "",
    borderColor: "",
  },
  link: {
    icon: LinkRounded,
    backgroundColor: "",
    borderColor: "",
  },
  markdown: {
    icon: Markdown as SvgIconComponent,
    backgroundColor: "",
    borderColor: "",
  },
  number: {
    icon: PinRounded,
    backgroundColor: "",
    borderColor: "",
  },
  one_to_many: {
    icon: AccountTreeRounded,
    backgroundColor: "",
    borderColor: "",
  },
  one_to_one: {
    icon: OneToOne as SvgIconComponent,
    backgroundColor: "",
    borderColor: "",
  },
  sort: {
    icon: FormatListNumberedRounded,
    backgroundColor: "",
    borderColor: "",
  },
  text: {
    icon: TitleRounded,
    backgroundColor: "",
    borderColor: "",
  },
  textarea: {
    icon: SubjectRounded,
    backgroundColor: "",
    borderColor: "",
  },
  uuid: {
    icon: PublicRoundedIcon,
    backgroundColor: "",
    borderColor: "",
  },
  wysiwyg_advanced: {
    icon: NewspaperRounded,
    backgroundColor: "",
    borderColor: "",
  },
  wysiwyg_basic: {
    icon: NewspaperRounded,
    backgroundColor: "",
    borderColor: "",
  },
  yes_no: {
    icon: ToggleOnRounded,
    backgroundColor: "",
    borderColor: "",
  },
};

export const generateIcon = (type: string) => {
  const icon = icons[type].icon;

  return <SvgIcon component={icon} sx={{ verticalAlign: "middle" }} />;
};
