import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { mediaManagerApi } from "../../../../../../../shell/services/mediaManager";
import { Bin, Group } from "../../../../../../../shell/services/types";
import { AppState } from "../../../../../../../shell/store/types";
import { FormValue } from "../views/FieldForm";
import { DropdownOptions } from "../FieldFormInput";

export interface ItemLimit {
  title: string;
  isChecked: boolean;
  value: string;
}

export interface LockFolder {
  title: string;
  isChecked: boolean;
  option: any;
}

export interface CustomGroup {
  value: string;
  label: string;
}

export const useMediaRules = () => {
  const [itemLimit, setItemLimit] = useState({
    title: "Media Item Limit",
    isChecked: false,
    value: "1",
  });
  const [lockFolder, setLockFolder] = useState({
    title: "Select Folder",
    isChecked: false,
    option: {
      value: "",
      label: "",
    },
  });

  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const { data: bins, isFetching: isBinsFetching } =
    mediaManagerApi.useGetBinsQuery({
      instanceId,
      ecoId,
    });

  const [groups, setGroups] = useState([]);
  const { data: binGroups, isFetching: isBinGroupsFetching } =
    mediaManagerApi.useGetAllBinGroupsQuery(
      bins?.map((bin: Bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );

  const mediaFoldersOptions: DropdownOptions[] = binGroups[0]?.map((field) => ({
    label: field.name,
    value: field.id,
  }));

  return {
    itemLimit,
    lockFolder,
    setItemLimit,
    setLockFolder,
    groups,
    mediaFoldersOptions,
  };
};
