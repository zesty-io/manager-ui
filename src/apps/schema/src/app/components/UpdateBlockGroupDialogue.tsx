import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import DriveFileRenameOutlineRounded from "@mui/icons-material/DriveFileRenameOutlineRounded";
import { useCreateGroupMutation } from "../../../../../shell/services/instance";
import { notify } from "../../../../../shell/store/notifications";
import { useDispatch } from "react-redux";
import { SelectBlockGroupInput, GroupType } from "./SelectBlockGroupInput";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

type UpdateBlockGroupDialogueProps = {
  onClose: () => void;
};
export const UpdateBlockGroupDialogue = ({
  onClose,
}: UpdateBlockGroupDialogueProps) => {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { id } = params;
  const dispatch = useDispatch();

  const [
    createGroup,
    {
      isLoading: isCreatingGroup,
      isSuccess: isGroupCreated,
      error: groupCreationError,
    },
  ] = useCreateGroupMutation();
  const [groupType, setGroupType] = useState<GroupType>("available");
  const [showGroupNameError, setShowGroupNameError] = useState(false);
  const [groupData, updateGroupData] = useReducer(
    (
      state: { newGroupName: string; groupZUID: string },
      action: Partial<{ newGroupName: string; groupZUID: string }>
    ) => {
      return {
        ...state,
        ...action,
      };
    },
    { newGroupName: null, groupZUID: null }
  );

  useEffect(() => {
    if (isGroupCreated) {
      onClose();
    }
  }, [isGroupCreated]);

  useEffect(() => {
    if (groupCreationError) {
      dispatch(
        notify({
          // @ts-ignore
          message: "Failed to update block group",
          kind: "error",
        })
      );
    }
  }, [groupCreationError]);

  const handleSave = () => {
    if (groupType === "available") {
    } else if (groupType === "new") {
      if (!groupData?.newGroupName?.trim()?.length) {
        setShowGroupNameError(true);
      } else {
        createGroup({
          name: groupData?.newGroupName?.trim(),
          resourceZUIDs: [id],
        });
      }
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "blue.50",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DriveFileRenameOutlineRounded color="info" />
        </Box>
        <Typography variant="h5" fontWeight={700} mt={1.5}>
          Update Block Group
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          This affects what group the block is presented on in the All Blocks
          page in the Blocks App.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <SelectBlockGroupInput
          groupType={groupType}
          onGroupTypeChange={(groupType) => setGroupType(groupType)}
          groupZUID={groupData?.groupZUID}
          onGroupZUIDChange={(zuid) => updateGroupData({ groupZUID: zuid })}
          newGroupName={groupData?.newGroupName}
          onNewGroupNameChange={(name) => {
            if (name?.length) {
              setShowGroupNameError(false);
            }

            updateGroupData({ newGroupName: name });
          }}
          showGroupNameError={showGroupNameError}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("cancel")}
        </Button>
        <Button
          onClick={handleSave}
          loading={isCreatingGroup}
          variant="contained"
        >
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
