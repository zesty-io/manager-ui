import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { mediaManagerApi } from "../../../../../../../shell/services/mediaManager";
import { FormValue } from "../views/FieldForm";

export const useMediaRules = () => {
  // Media rules
  const [itemLimit, setItemLimit] = useState({
    label: "Media Item Limit",
    isChecked: false,
    value: "1",
  });
  const [lockFolder, setLockFolder] = useState({
    label: "Select Folder",
    isChecked: false,
    value: {},
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

  useEffect(() => {
    setGroups(
      binGroups[0]?.map((group: any) => {
        return {
          value: group?.id,
          inputLabel: group?.name,
          component: group?.name,
        };
      })
    );
  }, [binGroups]);

  useEffect(() => {
    setLockFolder((prevData: any) => ({
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
