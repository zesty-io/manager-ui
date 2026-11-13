import { FC } from "react";
import { useTranslation } from "react-i18next";

import { EmptyResults } from "shell/components/EmptyResults";

interface EmptyStateProps {
  title: string;
  onReset: () => void;
}
export const EmptyState: FC<EmptyStateProps> = ({ title, onReset }) => {
  const { t } = useTranslation();
  return (
    <EmptyResults
      variant="filter"
      size="dialog"
      title={title}
      description={t("reports.emptyStateHint")}
      onAction={onReset}
    />
  );
};
