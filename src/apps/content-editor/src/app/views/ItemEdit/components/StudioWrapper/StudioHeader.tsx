import AutoAwesomeMosaicRoundedIcon from "@mui/icons-material/AutoAwesomeMosaicRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Box, Button, Chip, Switch } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { LanguageSelector } from "../ItemEditHeader/LanguageSelector";

type LayoutBreadcrumbItem = {
  layoutId?: string;
  label: string;
};

type StudioHeaderProps = {
  onLanguageChange: (langCode: string) => void;
  interactionMode: "content" | "layout";
  onInteractionModeChange: (mode: "content" | "layout") => void;
  selectedLayoutBreadcrumb: LayoutBreadcrumbItem[];
  onLayoutBreadcrumbClick: (layoutId: string) => void;
  pageModelZUID: string;
  pageItemZUID: string;
  unresolvedPath: boolean;
  logoSrc: string;
  onFeedbackClick: () => void;
};

const StudioModeSwitch = styled(Switch)(({ theme }) => ({
  width: 60,
  height: 32,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    width: 28,
    height: 28,
    borderRadius: "50%",
    backgroundColor: alpha(theme.palette.grey[900], 0.56),
    transitionDuration: "300ms",
    "&:hover": {
      backgroundColor: alpha(theme.palette.grey[900], 0.56),
    },
    "&.Mui-checked": {
      transform: "translateX(28px)",
      color: "#fff",
      backgroundColor: "#354497",
      "&:hover": {
        backgroundColor: "#354497",
      },
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.grey[100],
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: theme.palette.grey[300],
      border: "6px solid #fff",
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 28,
    height: 28,
    backgroundColor: "transparent",
    boxShadow: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: 18,
    },
  },
  "& .MuiSwitch-track": {
    borderRadius: 100,
    backgroundColor: theme.palette.grey[100],
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export const StudioHeader = ({
  onLanguageChange,
  interactionMode,
  onInteractionModeChange,
  selectedLayoutBreadcrumb,
  onLayoutBreadcrumbClick,
  pageModelZUID,
  pageItemZUID,
  unresolvedPath,
  logoSrc,
  onFeedbackClick,
}: StudioHeaderProps) => {
  const [codeIdSegment, ...pathSegments] = selectedLayoutBreadcrumb;

  return (
    <Box
      data-cy="StudioHeader"
      sx={{
        py: 1,
        px: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderBottom: (theme) => `1px solid ${theme.palette.border}`,
        backgroundColor: (theme) => theme.palette.grey[50],
      }}
    >
      <Box
        component="img"
        src={logoSrc}
        alt="Content One"
        data-cy="StudioLogo"
        sx={{ height: 32 }}
      />
      <Box flex="1" display="flex" justifyContent="center" minWidth={0} px={2}>
        {interactionMode === "layout" && selectedLayoutBreadcrumb.length ? (
          <Box
            data-cy="StudioBreadcrumbs"
            display="flex"
            alignItems="center"
            gap={0.5}
            minWidth={0}
            sx={{ overflow: "hidden", flexWrap: "nowrap" }}
          >
            {codeIdSegment ? (
              <Chip
                data-cy="StudioBreadcrumbRoot"
                label={codeIdSegment.label}
                size="small"
                variant="filled"
                sx={{
                  flexShrink: 0,
                  minWidth: 0,
                  maxWidth: 220,
                }}
              />
            ) : null}
            {pathSegments.length ? (
              <Box
                data-cy="StudioBreadcrumbRail"
                minWidth={0}
                sx={{
                  maxWidth: 252,
                  overflowX: "auto",
                  overflowY: "hidden",
                  direction: "rtl",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  sx={{
                    width: "max-content",
                    minWidth: "100%",
                    direction: "ltr",
                  }}
                >
                  {pathSegments.map((segment, index) => {
                    const isCurrent = index === pathSegments.length - 1;
                    return (
                      <Chip
                        data-cy="StudioBreadcrumbChip"
                        key={segment.layoutId || segment.label}
                        label={segment.label}
                        size="small"
                        variant="filled"
                        onClick={() => {
                          if (!segment.layoutId) return;
                          onLayoutBreadcrumbClick(segment.layoutId);
                        }}
                        clickable={Boolean(segment.layoutId)}
                        sx={{
                          flexShrink: 0,
                          minWidth: 0,
                          maxWidth: 220,
                          opacity: isCurrent ? 0.56 : 1,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Button
          data-cy="StudioFeedbackButton"
          color="inherit"
          size="small"
          onClick={onFeedbackClick}
          sx={{ fontWeight: 500 }}
        >
          Feedback
        </Button>
        <Box minWidth={96}>
          <LanguageSelector
            modelZUIDOverride={pageModelZUID}
            itemZUIDOverride={pageItemZUID}
            onChange={({ langCode }) => {
              if (!langCode) return;
              onLanguageChange(langCode);
            }}
            disabled={unresolvedPath}
          />
        </Box>
        <StudioModeSwitch
          data-cy="StudioModeToggle"
          checked={interactionMode === "layout"}
          onChange={(evt) =>
            onInteractionModeChange(evt.target.checked ? "layout" : "content")
          }
          icon={<EditRoundedIcon />}
          checkedIcon={<AutoAwesomeMosaicRoundedIcon />}
        />
      </Box>
    </Box>
  );
};
