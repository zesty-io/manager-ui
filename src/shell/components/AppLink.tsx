import { Link, LinkProps } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type AppLink = {
  to: string;
} & LinkProps;
export const AppLink = ({ to, children, ...props }: AppLink) => {
  return (
    <Link component={RouterLink} to={to} underline="none" {...props}>
      {children}
    </Link>
  );
};
