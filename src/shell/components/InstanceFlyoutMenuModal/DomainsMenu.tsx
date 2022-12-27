import { Dialog, DialogContent, DialogTitle } from "@mui/material";

interface Props {
  onClose?: () => void;
}

const DomainsMenu = ({ onClose }: Props) => {
  return (
    <Dialog
      PaperProps={{
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "448px",
          height: "392px",
        },
      }}
      open={true}
      onClose={onClose}
      fullWidth
      maxWidth={"xs"}
    >
      <DialogTitle>Domains</DialogTitle>
    </Dialog>
  );
};

export default DomainsMenu;
