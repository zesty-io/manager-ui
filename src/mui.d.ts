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
  export interface LeadsPalette {
    toolbar: string;
    toolbarLabel: string;
    rowHover: string;
    rowHoverBorder: string;
  }

  export interface StudioPalette {
    hoverOutline: string;
    selectionOutline: string;
  }

  export interface Palette {
    leads: LeadsPalette;
    studio: StudioPalette;
    red: Color;
    deepPurple: Color;
    deepOrange: Color;
    pink: Color;
    blue: Color;
    green: Color;
    purple: Color;
    yellow: Color;
  }

  export interface TypeBackground {
    shimmer: string;
    shimmerSweep: string;
    noticeBackground: string;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonPropsSizeOverrides {
    xsmall: true;
    xxsmall: true;
  }
}
