import { FC } from "react";
import { Database } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";

import { ContentModel } from "../../../services/types";
import { SearchListItem } from "./SearchListItem";

interface Model {
  data: ContentModel;
  loading?: boolean;
  style: any;
}
export const Model: FC<Model> = ({ data, style, loading = false }) => {
  return (
    <SearchListItem
      title={data.label}
      url=""
      chips=""
      icon={Database as SvgIconComponent}
      style={style}
    />
  );
};
