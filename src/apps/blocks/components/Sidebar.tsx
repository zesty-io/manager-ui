import { useState } from "react";
import { useHistory } from "react-router";
import { Box } from "@mui/material";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import { useTranslation } from "react-i18next";

import { AppSideBar, SubMenu } from "../../../shell/components/AppSidebar";
import { useParams } from "../../../shell/hooks/useParams";
import { useGetContentModelsQuery } from "../../../shell/services/instance";
import { ModelList } from "../../schema/src/app/components/Sidebar/ModelList";
import { CreateModelDialogue } from "../../schema/src/app/components/CreateModelDialogue";
import { EmptyResults } from "shell/components/EmptyResults";

export const Sidebar = () => {
  const { t } = useTranslation();
  const { data: models, isLoading } = useGetContentModelsQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const history = useHistory();
  const [filter, setFilter] = useState("");
  const [isCreateModelDialogueOpen, setIsCreateModelDialogueOpen] =
    useState(false);

  const subMenu: SubMenu[] = [
    {
      name: t("blocks.allBlocks"),
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
        headerTitle={t("shell.navBlocks")}
        mode="dark"
        subMenus={subMenu}
        searchPlaceholder={t("blocks.filterBlocks")}
        titleButtonTooltip={t("blocks.createBlock")}
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
          <EmptyResults
            variant="search"
            size="compact"
            title={t("blocks.noResultsAvailable", { filter })}
          />
        )}
      </AppSideBar>
      {isCreateModelDialogueOpen && (
        <CreateModelDialogue
          typeIsSet={true}
          modelType="block"
          onClose={() => setIsCreateModelDialogueOpen(false)}
        />
      )}
    </>
  );
};
