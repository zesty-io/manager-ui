const CONTENT_APP_PATTERN = /^\/content\/[^/]+\/[^/]+$/;
const CONTENT_META_PATTERN = /^\/content\/[^/]+\/[^/]+\/meta$/;
const BLOCKS_PATTERN = /^\/blocks\/[^/]+\/[^/]+\/?$/;
const CODE_APP_PATTERN = /^\/code\/file\/.+/;

export const isContentAppPath = (pathname: string) =>
  CONTENT_APP_PATTERN.test(pathname);

export const isContentMetaPath = (pathname: string) =>
  CONTENT_META_PATTERN.test(pathname);

export const isBlocksPath = (pathname: string) => BLOCKS_PATTERN.test(pathname);

export const isCodeAppPath = (pathname: string) =>
  CODE_APP_PATTERN.test(pathname);

// Single source of truth for which routes the AI drawer supports, shared
// between GlobalTopbar (toggle visibility) and AIDrawer (render gating) so
// the two can't drift apart.
export const isAIDrawerSupportedPath = (pathname: string): boolean =>
  isContentAppPath(pathname) ||
  isContentMetaPath(pathname) ||
  isBlocksPath(pathname) ||
  isCodeAppPath(pathname);
