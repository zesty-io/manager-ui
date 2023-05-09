import { useState, useMemo } from "react";
import { isEmpty } from "lodash";

import { ContentModel } from "../services/types";
import { useGetContentModelsQuery } from "../services/instance";

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

/**
 * This hook is used to easily filter content models via a keyword that will
 * match the following:
 * - Model title
 * - Model ZUID
 * - Model type
 */
type UseSearchModelsByKeyword = [ContentModel[], (searchTerm: string) => void];
export const useSearchModelsByKeyword: () => UseSearchModelsByKeyword = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: models } = useGetContentModelsQuery();

  const filteredModels: ContentModel[] = useMemo(() => {
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
      // TODO: Verify if we still need to use a fuzzy search lib
      return models.filter(
        (model) =>
          model.label?.toLowerCase().includes(term) ||
          model.ZUID === term ||
          model.type === modelDatatype
      );
    }

    return [];
  }, [models, searchTerm]);

  return [filteredModels, setSearchTerm];
};
