import { useState } from "react";
import { useHistory } from "react-router";
import { Box, Stack, Typography } from "@mui/material";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";

import { AppSideBar, SubMenu } from "../../../shell/components/AppSidebar";
import { useParams } from "../../../shell/hooks/useParams";
import { useGetContentModelsQuery } from "../../../shell/services/instance";
import { ModelList } from "../../schema/src/app/components/Sidebar/ModelList";
import { CreateModelDialogue } from "../../schema/src/app/components/CreateModelDialogue";
import noSearchResults from "../../../../public/images/noSearchResults.svg";

export const Sidebar = () => {
  const { data: models, isLoading } = useGetContentModelsQuery();
  const history = useHistory();
  const [filter, setFilter] = useState("");
  const [isCreateModelDialogueOpen, setIsCreateModelDialogueOpen] =
    useState(false);

  const subMenu: SubMenu[] = [
    {
      name: "All Blocks",
      path: "/blocks",
      icon: GridViewRoundedIcon,
    },
  ];

  const filteredModels = models?.filter(
    (model) =>
      model.type === "block" &&
      model.label?.toLowerCase().includes(filter?.toLowerCase())
  );

  return (
    <>
      <AppSideBar
        data-cy="blocks-nav"
        headerTitle="Blocks"
        mode="dark"
        subMenus={subMenu}
        searchPlaceholder="Filter Blocks"
        titleButtonTooltip="Create Block"
        hideSubMenuOnSearch={false}
        filterKeyword={filter}
        onAddClick={() => setIsCreateModelDialogueOpen(true)}
        onFilterChange={(keyword: any) => {
          setFilter(keyword);
        }}
      >
        {!isLoading && (
          <Box mt={1.5}>
            <ModelList
              title="blocks"
              type="block"
              models={filteredModels || []}
              app="blocks"
            />
          </Box>
        )}
        {!isLoading && filter && !filteredModels?.length && (
          <Stack gap={1.5} alignItems="center" justifyContent="center" p={1.5}>
            <img
              src={noSearchResults}
              alt="No search results"
              width="70px"
              height="64px"
            />
            <Typography color="text.secondary" variant="body2" align="center">
              No results available for "{filter}"
            </Typography>
          </Stack>
        )}
      </AppSideBar>
      {isCreateModelDialogueOpen && (
        <CreateModelDialogue
          modelType="block"
          onClose={() => setIsCreateModelDialogueOpen(false)}
        />
      )}
    </>
  );
};
