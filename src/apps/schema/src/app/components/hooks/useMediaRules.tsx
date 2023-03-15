import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { mediaManagerApi } from "../../../../../../shell/services/mediaManager";
import { Bin } from "../../../../../../shell/services/types";
import { AppState } from "../../../../../../shell/store/types";

export interface CustomGroup {
  value: string;
  label: string;
}

export const useMediaRules = () => {
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const instanceId = useSelector((state: any) => state.instance.ID);
  const { data: bins, isFetching: isBinsFetching } =
    mediaManagerApi.useGetBinsQuery({
      instanceId,
      ecoId,
    });

  const { data: binGroups, isFetching: isBinGroupsFetching } =
    mediaManagerApi.useGetAllBinGroupsQuery(
      bins?.map((bin: Bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );
  const [mediaFoldersOptions, setMediaFoldersOptions] = useState([]);

  useEffect(() => {
    if (binGroups?.length) {
      const res = binGroups[0]?.map((field) => ({
        label: field.name,
        value: field.id,
      }));
      setMediaFoldersOptions(res);
    }
  }, [binGroups]);

  return {
    mediaFoldersOptions,
  };
};
