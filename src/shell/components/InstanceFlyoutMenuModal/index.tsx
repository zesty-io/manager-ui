import { Dialog, DialogTitle } from "@mui/material";

interface Props {
  onClose?: () => void;
}

const InstanceFlyoutMenuModal = ({ onClose }: Props) => {
  return (
    <Dialog open={true} fullWidth maxWidth={"xs"} onClose={onClose}>
      <DialogTitle></DialogTitle>
    </Dialog>
  );
};

export default InstanceFlyoutMenuModal;
