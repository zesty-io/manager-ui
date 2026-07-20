import {
  ContentItem,
  ContentModel,
  ContentModelField,
  WebView,
  Stylesheet,
  Script,
  CreateStatusLabel,
  WorkflowStatusLabel,
} from "../src/shell/services/types";
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
          contentModelZUID: string;
          datatype: string;
          description: string;
          label: string;
          name: string;
          required: boolean;
          settings: {
            defaultValue: string;
            list: boolean;
          };
          sort: number;
        }
      ): Chainable<any>;
      deleteStatusLabels(labels: string[]): Chainable<any>;
      deleteModel(zuid: string): Chainable<any>;
      deleteModels(models: string[]): Chainable<any>;
      task(
        event: "seed:content",
        path: string
      ): Chainable<{
        model: Partial<ContentModel>;
        fields: Partial<ContentModelField>;
        items: Partial<ContentItem>;
      }>;
      task(
        event: "seed:code",
        path: string
      ): Chainable<
        Partial<WebView> | Partial<Script> | Partial<Stylesheet> | null
      >;
      task(event: "cleanup:labels"): Chainable<string[]>;
      task(
        event: "api:createLabel",
        data: CreateStatusLabel
      ): Chainable<WorkflowStatusLabel>;
    }
  }
}
