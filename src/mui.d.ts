import { Color } from "@mui/material";
import {
  alpha,
  PaletteOptions,
  TypographyVariantsOptions,
} from "@mui/material/styles";

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
