import AutoAwesomeMosaicRoundedIcon from "@mui/icons-material/AutoAwesomeMosaicRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Box, Chip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { LanguageSelector } from "../../content-editor/src/app/views/ItemEdit/components/ItemEditHeader/LanguageSelector";
import { InteractionMode, usesLayoutGrammar } from "../hooks/studioTypes";

type LayoutBreadcrumbItem = {
  layoutId?: string;
  label: string;
};

type StudioHeaderProps = {
  onLanguageChange: (langCode: string) => void;
  interactionMode: InteractionMode;
  onInteractionModeChange: (mode: InteractionMode) => void;
  /** Modes this user is entitled to. The switch can never exceed these. */
  availableModes: InteractionMode[];
  /**
   * Whether the mode switch is offered at all. Mode is normally resolved from
   * permissions and not selectable; Zesty staff keep the switch so one account
   * can exercise every surface.
   */
  canSelectMode: boolean;
  selectedLayoutBreadcrumb: LayoutBreadcrumbItem[];
  onLayoutBreadcrumbClick: (layoutId: string) => void;
  pageModelZUID: string;
  pageItemZUID: string;
  unresolvedPath: boolean;
  logoSrc: string;
};

const MODE_OPTIONS: {
  mode: InteractionMode;
  label: string;
  icon: JSX.Element;
}[] = [
  {
    mode: "full",
    label: "Full",
    icon: <AutoAwesomeRoundedIcon fontSize="small" />,
  },
  {
    mode: "content",
    label: "Content",
    icon: <EditRoundedIcon fontSize="small" />,
  },
  {
    mode: "layout",
    label: "Layout",
    icon: <AutoAwesomeMosaicRoundedIcon fontSize="small" />,
  },
];

export const StudioHeader = ({
  onLanguageChange,
  interactionMode,
  onInteractionModeChange,
  availableModes,
  canSelectMode,
  selectedLayoutBreadcrumb,
  onLayoutBreadcrumbClick,
  pageModelZUID,
  pageItemZUID,
  unresolvedPath,
  logoSrc,
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
        {usesLayoutGrammar(interactionMode) &&
        selectedLayoutBreadcrumb.length ? (
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
        {canSelectMode && availableModes.length > 1 ? (
          <ToggleButtonGroup
            data-cy="StudioModeToggle"
            exclusive
            size="small"
            value={interactionMode}
            onChange={(_evt, nextMode: InteractionMode | null) => {
              // An exclusive group emits null when the active button is
              // clicked again. There is no "no mode" state, so ignore it
              // rather than letting it through as a mode change.
              if (!nextMode) return;
              onInteractionModeChange(nextMode);
            }}
          >
            {MODE_OPTIONS.filter((option) =>
              availableModes.includes(option.mode)
            ).map((option) => (
              <ToggleButton
                key={option.mode}
                value={option.mode}
                data-cy={`StudioModeToggleOption-${option.mode}`}
                aria-label={option.label}
              >
                {option.icon}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : null}
      </Box>
    </Box>
  );
};
