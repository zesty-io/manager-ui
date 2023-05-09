import { useState, useMemo } from "react";
import { isEmpty } from "lodash";

import { Suggestion } from "../index";
import { useGetContentModelsQuery } from "../../../services/instance";

const templatesetKeywords = [
  "single page model",
  "single page models",
  "singlepage model",
  "singlepage models",
];
const pagesetKeywords = [
  "multi page model",
  "multi page models",
  "multipage model",
  "multipage models",
];
const datasetKeywords = [
  "headless data",
  "headless data models",
  "headless data model",
];

type UseFilteredModels = [Suggestion[], (searchTerm: string) => void];
export const useFilteredModels: () => UseFilteredModels = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: models } = useGetContentModelsQuery();

  const filteredModels: Suggestion[] = useMemo(() => {
    let modelDatatype = "";
    const term = searchTerm?.toLowerCase();

    // Check if the user's keyword is a datatype
    if (templatesetKeywords.includes(term)) {
      modelDatatype = "templateset";
    }

    if (pagesetKeywords.includes(term)) {
      modelDatatype = "pageset";
    }

    if (datasetKeywords.includes(term)) {
      modelDatatype = "dataset";
    }

    // Filter models
    if (!isEmpty(models)) {
      /**
       * Allow users to match models via the ff:
       * - Model title
       * - Model ZUID
       * - Model type
       */
      // TODO: Verify if we still need to use a fuzzy search lib for the model type keywords and model label
      const _models = models.filter(
        (model) =>
          model.label?.toLowerCase().includes(term) ||
          model.ZUID === term ||
          model.type === modelDatatype
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
