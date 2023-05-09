import { useState, useMemo } from "react";
import { isEmpty } from "lodash";

import { Suggestion } from "../index";
import { useGetContentModelsQuery } from "../../../services/instance";

type UseFilteredModels = [Suggestion[], (searchTerm: string) => void];
export const useFilteredModels: () => UseFilteredModels = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: models } = useGetContentModelsQuery();

  const filteredModels: Suggestion[] = useMemo(() => {
    if (!isEmpty(models)) {
      const _models = models.filter((model) =>
        model.label?.toLowerCase().includes(searchTerm?.toLowerCase())
      );

      return _models.map((model) => {
        return {
          type: "schema",
          ZUID: model.ZUID,
          title: model.label,
          updatedAt: model.updatedAt,
          url: `/schema/${model.ZUID}`,
        };
      });
    }

    return [];
  }, [models, searchTerm]);

  return [filteredModels, setSearchTerm];
};
