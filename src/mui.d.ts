import { Color } from "@mui/material";
import {
  alpha,
  PaletteOptions,
  TypographyVariantsOptions,
} from "@mui/material/styles";
import { IconButtonPropsSizeOverrides } from "@mui/material/IconButton";

declare module "@mui/material/Typography" {
  export interface TypographyPropsVariantOverrides {
    body3: true;
  }
}

declare module "@mui/material/styles" {
  export interface Palette {
    red: Color;
    deepPurple: Color;
    deepOrange: Color;
    pink: Color;
    blue: Color;
    green: Color;
    purple: Color;
    yellow: Color;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonPropsSizeOverrides {
    xsmall: true;
    xxsmall: true;
  }
}

declare module "@mui/material/styles" {
  // One-off tokens minted per docs/design-system.md §4 for values with no
  // existing ramp/semantic match, consumed outside sx (so a "path.string"
  // can't resolve them) — see the themeOverrides.custom comment in
  // src/shell/index.js for each entry's rationale.
  interface Theme {
    custom: {
      navTreeDragOverBackground: string;
    };
  }
  interface ThemeOptions {
    custom?: {
      navTreeDragOverBackground?: string;
    };
  }
}
