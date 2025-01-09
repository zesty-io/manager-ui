import "./commands";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      waitOn(path: string, cb: () => void): Chainable<JQuery<HTMLElement>>;
      login(): Chainable<JQuery<HTMLElement>>;
      getBySelector(
        selector: string,
        ...args: any[]
      ): Chainable<JQuery<HTMLElement>>;
      blockLock(): Chainable<JQuery<HTMLElement>>;
      assertClipboardValue(value: string): Chainable<JQuery<HTMLElement>>;
      blockAnnouncements(): Chainable<JQuery<HTMLElement>>;
      apiRequest(
        options: Partial<Cypress.RequestOptions>
      ): Chainable<Cypress.Response<any>>;
      workflowStatusLabelCleanUp(): Chainable<JQuery<HTMLElement>>;
      cleanTestData(): Chainable<JQuery<HTMLElement>>;
      createTestData(): Chainable<JQuery<HTMLElement>>;
      goToWorkflowsPage(): Chainable<JQuery<HTMLElement>>;
      getStatusLabel(): Chainable<JQuery<HTMLElement>>;
    }
  }
}
