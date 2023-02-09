import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { mediaManagerApi } from "../../../../../../../shell/services/mediaManager";
import { Group } from "../../../../../../../shell/services/types";
import { FormValue } from "../views/FieldForm";

export interface ItemLimit {
  label: string;
  isChecked: boolean;
  value: string;
}

export interface LockFolder {
  label: string;
  isChecked: boolean;
  value: any;
}

export interface CustomGroup {
  value: string;
  inputLabel: string;
  component: string;
}

export const useMediaRules = () => {
  const [itemLimit, setItemLimit] = useState({
    label: "Media Item Limit",
    isChecked: false,
    value: "1",
  });
  const [lockFolder, setLockFolder] = useState({
    label: "Select Folder",
    isChecked: false,
    value: {
      id: "",
      inputLabel: "",
      component: "",
    },
  });

  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const { data: bins, isFetching: isBinsFetching } =
    mediaManagerApi.useGetBinsQuery({
      instanceId,
      ecoId,
    });

  const [groups, setGroups] = useState([]);
  const { data: binGroups, isFetching: isBinGroupsFetching } =
    mediaManagerApi.useGetAllBinGroupsQuery(
      bins?.map((bin: any) => bin.id),
      {
        skip: !bins?.length,
      }
    );

  // set initial value
  useEffect(() => {
    if (binGroups?.length) {
      setGroups(
        binGroups[0]?.map((group: Group) => {
          return {
            id: group?.id,
            inputLabel: group?.name,
            component: group?.name,
          };
        }) || []
      );
    }
  }, [binGroups]);

  useEffect(() => {
    setLockFolder((prevData: LockFolder) => ({
      ...prevData,
      value: groups[0],
    }));
  }, [groups]);

  return {
    itemLimit,
    lockFolder,
    setItemLimit,
    setLockFolder,
    groups,
  };
};
