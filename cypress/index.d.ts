import "./support/commands";

declare global {
  namespace Cypress {
    interface Chainable {
      waitOn(path: string, cb: () => void): Chainable<void>;
      login(): Chainable<void>;
      getBySelector(
        selector: string,
        ...args: any[]
      ): Chainable<JQuery<HTMLElement>>;
      blockLock(): Chainable<void>;
      assertClipboardValue(value: string): Chainable<void>;
      blockAnnouncements(): Chainable<void>;
      getElement(selector: string): Chainable<JQuery<HTMLElement>>;
      apiRequest(options: {
        url: string;
        method?: string;
        body?: any;
      }): Chainable<any>;
      createModel(options: {
        description: string;
        label: string;
        type: string;
        name: string;
        listed: boolean;
      }): Chainable<any>;
      createItems(
        modelZUID: string,
        items: {
          web?: {
            [key: string]: any;
          };
          meta?: {
            [key: string]: any;
          };
          data?: {
            [key: string]: any;
          };
        }[]
      ): Chainable<any>;
      getItems(modelZUID: string): Chainable<any>;
      updateItem(
        modelZUID: string,
        itemZUID: string,
        data: { [key: string]: any }
      ): Chainable<any>;
      createStatusLabel(
        name: string,
        description: string,
        color: string,
        addPermissionRoles: string[],
        removePermissionRoles: string[],
        allowPublish: boolean
      ): Chainable<any>;
      createField(
        zuid: string,
        payload: {
          contentModelZUID?: string;
          datatype: string;
          description?: string;
          label: string;
          name: string;
          required?: boolean;
          settings?: {
            [key: string]: any;
          };
          sort?: number;
        }
      ): Chainable<any>;
      deleteStatusLabels(labels: string[]): Chainable<any>;
      deleteModel(zuid: string): Chainable<any>;
      deleteModels(models: string[]): Chainable<any>;
    }
  }
}
