import "./commands";

interface AwaitResponseOptions {
  alias?: string;
  timeout?: number;
  interval?: number;
}

interface AwaitResponseResult {
  started: number;
  finished: number;
  waited: number;
}

declare global {
  namespace Cypress {
    interface Chainable {
      waitOn(path: string, cb: () => void): Chainable<JQuery<HTMLElement>>;
      login(): Chainable<JQuery<HTMLElement>>;
      getBySelector(
        selector: string,
        ...args: any[]
      ): Chainable<JQuery<HTMLElement>>;
      blockLock(): Chainable<JQuery<HTMLElement>>;
      assertClipboardValue(value: string): Chainable<JQuery<HTMLElement>>;
      blockAnnouncements(): Chainable<JQuery<HTMLElement>>;

      apiRequest(options: {
        url: string;
        method?: string;
        body?: any;
      }): Chainable<any>;
      // workflowStatusLabelCleanUp(): Chainable<JQuery<HTMLElement>>;
      cleanTestData(): Chainable<JQuery<HTMLElement>>;
      createTestData(): Chainable<JQuery<HTMLElement>>;
      goToWorkflowsPage(): Chainable<JQuery<HTMLElement>>;
      getStatusLabels(): Chainable<any>;
      // deleteStatusLabels(labels: string[]): Chainable<void>;
      cleanStatusLabels(): Chainable<void>;
      deleteStatusLabels(labels: string[]): Chainable<void>;
      deleteContentModels(models: string[]): Chainable<void>;
      createContentModel({
        description: string,
        label: string,
        type: string,
        name: string,
        listed: boolean,
      }): Chainable<void>;
    }
  }
}
