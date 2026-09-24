import {
  ItemWorkflowStatus,
  WorkflowStatusLabel,
} from "../shell/services/types";

/**
 * Determines whether an item's *current* version has a workflow status that
 * allows publishing, given the instance-wide workflow status labels and the
 * item's own workflow status history.
 *
 * Instances that have never configured any `allowPublish` status labels are
 * "default-open" -- every item is publishable regardless of status. This
 * default must be preserved by every call site that reuses this helper.
 */
export function isPublishAllowedByWorkflowStatus(
  statusLabels: WorkflowStatusLabel[] | undefined,
  itemWorkflowStatus: ItemWorkflowStatus[] | undefined,
  itemVersion: number
): boolean {
  const allowPublishLabelZUIDs = statusLabels?.reduce<string[]>(
    (acc, next) => (next.allowPublish ? [...acc, next.ZUID] : acc),
    []
  );

  if (!allowPublishLabelZUIDs?.length) {
    return true;
  }

  const itemWorkflowLabelZUIDs = itemWorkflowStatus?.find(
    (status) => status.itemVersion === itemVersion
  )?.labelZUIDs;

  return !!itemWorkflowLabelZUIDs?.some((labelZUID) =>
    allowPublishLabelZUIDs.includes(labelZUID)
  );
}
