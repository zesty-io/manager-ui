class ContentItemPage {
  elements = {
    createItemButton: () => cy.getBySelector("CreateItemSaveButton"),
    duoModeToggle: () => cy.getBySelector("DuoModeToggle"),
    moreMenu: () => cy.getBySelector("ContentItemMoreButton"),
    deleteItemButton: () => cy.getBySelector("DeleteContentItem"),
    confirmDeleteItemButton: () =>
      cy.getBySelector("DeleteContentItemConfirmButton"),
    versionSelector: () => cy.getBySelector("VersionSelector"),
    versionItem: () => cy.getBySelector("VersionItem"),
    addWorkflowStatusLabel: () => cy.getBySelector("AddWorkflowStatusLabel"),
    workflowStatusLabelOption: () =>
      cy.getBySelector("WorkflowStatusLabelOption"),
    activeWorkflowStatusLabel: () =>
      cy.getBySelector("ActiveWorkflowStatusLabel"),
    publishItemButton: () => cy.getBySelector("PublishButton"),
    confirmPublishItemButton: () => cy.getBySelector("ConfirmPublishButton"),
    toast: () => cy.getBySelector("toast"),
    contentPublishedIndicator: () =>
      cy.getBySelector("ContentPublishedIndicator"),
  };
}

export default new ContentItemPage();
