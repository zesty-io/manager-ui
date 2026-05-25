import { useCallback, useState } from "react";
import { Box } from "@mui/material";
import { ApiDataWithIdProps } from "../types";
import { IntegrationFieldConfig } from "../../../services/types";
import Draggable from "./Draggable";
import { getKeyValue } from "../utils";
import DisplayCard from "../Shared/DisplayCard";
import JsonViewer from "../Shared/JsonViewer";

const SelectedListItems = ({
  items,
  config,
  onChange,
}: {
  items: ApiDataWithIdProps[];
  config: IntegrationFieldConfig;
  onChange: (items: any[]) => void;
}) => {
  const [jsonData, setJsonData] = useState<string | null>(null);
  const [jsonViewerIsOpen, setJsonViewerIsOpen] = useState(false);
  const handleDelete = useCallback(
    (id: string) => {
      const newItems = items?.filter((item) => item?._itemId !== id);
      onChange(newItems);
    },
    [items, onChange]
  );
  const viewJson = useCallback((data: any) => {
    setJsonData(data);
    setJsonViewerIsOpen(true);
  }, []);

  const moveItem = useCallback(
    (from: number, to: number) => {
      const newItems = [...items];
      const [removed] = newItems.splice(from, 1);
      newItems.splice(to, 0, removed);

      onChange(newItems);
    },
    [items, onChange]
  );

  return (
    <>
      <Box
        width="100%"
        position="relative"
        display="block"
        data-cy="integrationListValueContainer"
      >
        {items?.map((item, index) => {
          return (
            <Draggable
              key={item?._itemId}
              id={item?._itemId}
              index={index}
              moveItem={moveItem}
              onDelete={() => handleDelete(item?._itemId)}
              onView={() => viewJson(item)}
            >
              <DisplayCard
                type={config?.type}
                heading={getKeyValue(item, config?.keyPaths?.heading || null)}
                subHeading={getKeyValue(
                  item,
                  config?.keyPaths?.subHeading || null
                )}
                thumbnail={getKeyValue(
                  item,
                  config?.keyPaths?.thumbnail || null
                )}
                detail={getKeyValue(item, config?.keyPaths?.detail || null)}
                details={
                  config?.type !== "details"
                    ? null
                    : config?.keyPaths?.details.map((detailKey: string) => ({
                        key: detailKey,
                        value: getKeyValue(item, detailKey),
                      }))
                }
              />
            </Draggable>
          );
        })}
      </Box>
      <JsonViewer
        open={jsonViewerIsOpen}
        onClose={() => setJsonViewerIsOpen(false)}
        data={jsonData}
        showCloseButton={true}
        isSlider={false}
      />
    </>
  );
};

export default SelectedListItems;
