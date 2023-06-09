import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";

import { Group } from "../services/types";
import {
  useGetAllBinGroupsQuery,
  useGetBinsQuery,
} from "../services/mediaManager";

type UseSearchMediaFoldersByKeyword = [Group[], (searchTerm: string) => void];
export const useSearchMediaFoldersByKeyword: () => UseSearchMediaFoldersByKeyword =
  () => {
    const [searchTerm, setSearchTerm] = useState("");
    const instanceId = useSelector((state: any) => state.instance.ID);
    const ecoId = useSelector((state: any) => state.instance.ecoID);
    const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
    const { data: folders } = useGetAllBinGroupsQuery(
      bins?.map((bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );

    // console.log(folders?.flat(Infinity));

    // Filter folders by folder name
    const filteredFolders: Group[] = useMemo(() => {
      if (!isEmpty(folders)) {
        const term = searchTerm.toLowerCase();
        const _folders = folders?.flat(Infinity) as Group[];

        return _folders?.filter((folder) =>
          folder.name?.toLowerCase().includes(term)
        );
      }

      return [];
    }, [folders, searchTerm]);

    return [filteredFolders, setSearchTerm];
  };
