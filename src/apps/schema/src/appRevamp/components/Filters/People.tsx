import { FilterButton } from "./FilterButton";
import { useGetUsersQuery } from "../../../../../../shell/services/accounts";

// TODO: Add functionality
export const People = () => {
  const { data: users } = useGetUsersQuery();

  return (
    <FilterButton
      isFilterActive={false}
      buttonText="People"
      onOpenMenu={() => {}}
      onRemoveFilter={() => {}}
    />
  );
};
