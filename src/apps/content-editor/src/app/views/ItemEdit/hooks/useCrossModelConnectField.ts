import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelsQuery,
} from "../../../../../../../shell/services/instance";
import { AppState } from "../../../../../../../shell/store/types";
import { ConnectField } from "./studioTypes";

// Read-back for a cross-item Parsley reference.
//
// Building a reference is easy — the user just picked the model and field, so we
// hold both. Reading one back out of a template is not: all the template gives
// us is a model NAME and an item ZUID, so the model's ZUID, the field's label
// and its datatype (which drives the chip icon) all need a fetch.
//
// The three states matter because of what the panel does with them. Parsing is
// synchronous, so the panel already knows the slot IS connected before this hook
// resolves anything — it renders the chip immediately and uses `resolving` only
// to skeleton the caption. It must never fall back to a text input while we
// fetch: an input rendered even for one frame is an input a keystroke can land
// in, and that keystroke would overwrite the binding.
export type CrossModelResolution =
  | { status: "resolving"; field: ConnectField }
  | { status: "resolved"; field: ConnectField }
  | { status: "unresolved"; field: ConnectField; reason: "model" | "field" };

export const useCrossModelConnectField = (
  source: { modelName: string; itemZUID: string } | undefined,
  fieldName: string,
  isMedia: boolean
): CrossModelResolution | null => {
  const { data: models, isFetching: isFetchingModels } =
    useGetContentModelsQuery(undefined, { skip: !source });

  const model = useMemo(() => {
    if (!source?.modelName || !models) return undefined;
    // Two models in different folders can share a `name`. Parsley itself is
    // ambiguous here — the renderer resolves `{{name.filter(...)}}` one way
    // regardless — so this only affects which model's LABELS we display, never
    // the expression we emit (that is built from the model the user picked).
    // Sort by ZUID so the choice is at least stable across reloads.
    return models
      .filter((candidate) => candidate.name === source.modelName)
      .sort((a, b) => a.ZUID.localeCompare(b.ZUID))[0];
  }, [models, source?.modelName]);

  const { data: fields, isFetching: isFetchingFields } =
    useGetContentModelFieldsQuery(
      { modelZUID: model?.ZUID },
      { skip: !model?.ZUID }
    );

  const field = useMemo(
    () => fields?.find((f) => !f.deletedAt && f.name === fieldName),
    [fields, fieldName]
  );

  // WHICH item, not just which model. A model like "Homepage" can have a dozen
  // locale siblings, so the model label alone doesn't identify the target — the
  // whole point of `filter(<zuid>)` is that it pins one. Read from the store
  // (the IndexedDB warm cache usually already holds it) and fall back to the
  // ZUID rather than firing a request per binding.
  // Subscribe to the ONE item, not the whole content map: `state.content` is
  // rebuilt on every content change, so selecting it would re-render every
  // cross-item chip in the panel on each keystroke anywhere in the app.
  const entry = useSelector(
    (state: AppState) => (state.content as any)[source?.itemZUID ?? ""]
  );
  const languages = useSelector((state: AppState) => state.languages);
  const itemLabel = useMemo(() => {
    if (!source?.itemZUID) return undefined;
    if (!entry) return source.itemZUID;
    const title =
      entry.web?.metaTitle ||
      entry.web?.metaLinkText ||
      entry.web?.path ||
      source.itemZUID;
    const langCode = (languages as any[])?.find(
      (lang) => lang.ID === entry.meta?.langID
    )?.code;
    return langCode ? `(${langCode}) ${title}` : title;
  }, [entry, languages, source?.itemZUID]);

  return useMemo(() => {
    if (!source) return null;

    const sourceBase = {
      modelName: source.modelName,
      modelZUID: model?.ZUID ?? "",
      itemZUID: source.itemZUID,
      modelLabel: model?.label,
      itemLabel,
    };

    if (
      !models ||
      isFetchingModels ||
      (model && (!fields || isFetchingFields))
    ) {
      return {
        status: "resolving",
        field: {
          name: fieldName,
          label: fieldName,
          // Guessing from the `.getImage()` suffix means the chip's icon is
          // already right for the common case and doesn't visibly swap when the
          // real datatype lands.
          datatype: isMedia ? "images" : "",
          source: sourceBase,
        },
      };
    }

    if (!model) {
      return {
        status: "unresolved",
        reason: "model",
        field: {
          name: fieldName,
          label: fieldName,
          datatype: isMedia ? "images" : "",
          source: sourceBase,
        },
      };
    }

    if (!field) {
      return {
        status: "unresolved",
        reason: "field",
        field: {
          name: fieldName,
          label: fieldName,
          datatype: isMedia ? "images" : "",
          source: sourceBase,
        },
      };
    }

    return {
      status: "resolved",
      field: {
        name: field.name,
        label: field.label || field.name,
        datatype: field.datatype,
        source: sourceBase,
      },
    };
  }, [
    field,
    fields,
    fieldName,
    isFetchingFields,
    isFetchingModels,
    isMedia,
    itemLabel,
    model,
    models,
    source,
  ]);
};
