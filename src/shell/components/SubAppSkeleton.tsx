import { Box, Skeleton } from "@mui/material";
import { LoadingQuote } from "./LoadingQuote";

const APP_NAV_KEY_MAP: Record<string, string> = {
  settings: "settingsNav",
  content: "contentNav",
  media: "mediaNav",
  apps: "appsNav",
  reports: "reportsNav",
  schema: "schemaNav",
  blocks: "blocksNav",
  code: "codeAppNav",
};

const NO_SIDEBAR_APPS = new Set(["", "launchpad", "leads", "redirects"]);

const SKELETON_BG = "#344054";
const SIDEBAR_BG = "#101828";

function getSidebarState(): { show: boolean; width: number } {
  const openApp = window.location.pathname.split("/")[1];
  if (NO_SIDEBAR_APPS.has(openApp)) {
    return { show: false, width: 0 };
  }
  const navKey = APP_NAV_KEY_MAP[openApp];
  if (!navKey) {
    return { show: true, width: 220 };
  }
  try {
    const collapsed =
      localStorage.getItem(`zesty:collapsedContainer:${navKey}`) === "true";
    if (collapsed) {
      return { show: false, width: 0 };
    }
    const stored = localStorage.getItem(`zesty:resizableContainer:${navKey}`);
    return { show: true, width: stored ? Number(stored) : 220 };
  } catch {
    return { show: true, width: 220 };
  }
}

const NavTreeItem = () => (
  <Box
    sx={{ display: "flex", gap: 1, alignItems: "center", height: 24, mr: 3 }}
  >
    <Skeleton
      animation="pulse"
      variant="circular"
      width={16}
      height={16}
      sx={{ flexShrink: 0, bgcolor: SKELETON_BG }}
    />
    <Skeleton
      animation="pulse"
      variant="rectangular"
      sx={{ flex: 1, height: 12, borderRadius: 0.5, bgcolor: SKELETON_BG }}
    />
  </Box>
);

export const SubAppSkeleton = () => {
  const { show: showSidebar, width: sidebarWidth } = getSidebarState();

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {showSidebar && (
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            bgcolor: SIDEBAR_BG,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            p: 1.5,
            overflow: "hidden",
          }}
        >
          {/* app-title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 24,
            }}
          >
            <Skeleton
              animation="pulse"
              variant="rectangular"
              width={130}
              height={14}
              sx={{ borderRadius: 0.5, bgcolor: SKELETON_BG }}
            />
            <Skeleton
              animation="pulse"
              variant="rectangular"
              width={16}
              height={16}
              sx={{ borderRadius: 0.5, bgcolor: SKELETON_BG }}
            />
          </Box>

          {/* app-search */}
          <Skeleton
            animation="pulse"
            variant="rectangular"
            height={36}
            sx={{ borderRadius: 0.5, bgcolor: SKELETON_BG }}
          />

          {/* app-sub-menu */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              height: 24,
              my: 0.75,
              mr: 0.5,
            }}
          >
            <Skeleton
              animation="pulse"
              variant="circular"
              width={24}
              height={24}
              sx={{ flexShrink: 0, bgcolor: SKELETON_BG }}
            />
            <Skeleton
              animation="pulse"
              variant="rectangular"
              sx={{
                flex: 1,
                height: 14,
                borderRadius: 0.5,
                bgcolor: SKELETON_BG,
              }}
            />
          </Box>

          {/* nav-tree-title */}
          <Box
            sx={{
              height: 20,
              width: 80,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Skeleton
              animation="pulse"
              variant="rectangular"
              width="100%"
              height={12}
              sx={{ borderRadius: 0.5, bgcolor: SKELETON_BG }}
            />
          </Box>

          {Array.from({ length: 10 }, (_, i) => (
            <NavTreeItem key={i} />
          ))}

          {/* nav-tree-title (second group) */}
          <Box
            sx={{
              height: 20,
              width: 80,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Skeleton
              animation="pulse"
              variant="rectangular"
              width="100%"
              height={12}
              sx={{ borderRadius: 0.5, bgcolor: SKELETON_BG }}
            />
          </Box>

          {Array.from({ length: 10 }, (_, i) => (
            <NavTreeItem key={`b${i}`} />
          ))}
        </Box>
      )}

      <LoadingQuote />
    </Box>
  );
};
