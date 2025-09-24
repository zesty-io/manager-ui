import "./support/commands";

type Model = {
  description?: string;
  label: string;
  type: string;
  name: string;
  listed?: boolean;
};

type Fields = {
  ZUID?: string | undefined;
  contentModelZUID?: string;
  datatype: string;
  description?: string;
  label: string;
  name: string;
  required?: boolean;
  relatedModelZUID?: string | undefined;
  relatedFieldZUID?: string | undefined;
  settings?: {
    list?: boolean;
    [key: string]: any;
  };
  sort?: number;
};

type Item = {
  web?: {
    [key: string]: any;
  };
  meta?: {
    [key: string]: any;
  };
  data?: {
    [key: string]: any;
  };
};

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
      getModels(): Chainable<any>;
      getModel(modelZUID: string): Chainable<any>;
      createModel(options: Model): Chainable<any>;
      createItems(modelZUID: string, items: Item[]): Chainable<any>;
      getItem(modelZUID: string, itemZUID: string): Chainable<any>;
      getItems(modelZUID: string): Chainable<any[]>;
      deleteItems(modelZUID: string, itemZUIDs: string[]): Chainable<void>;
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
      createField(modelZUID: string, payload: Fields): Chainable<any>;
      createFields(modelZUID: string, fields: Fields[]): Chainable<any>;
      updateFields(modelZUID: string, fields: Fields[]): Chainable<any[]>;
      getField(modelZUID: string, fieldZUID: string): Chainable<any>;
      getFields(modelZUID: string, showDeleted?: boolean): Chainable<any>;
      deleteFields(modelZUID: string, fieldZUIDs: string[]): Chainable<void>;
      undeleteFields(modelZUID: string, fieldZUIDs: string[]): Chainable<void>;
      deleteStatusLabels(labels: string[]): Chainable<any>;
      deleteModel(modelZUID: string): Chainable<any>;
      deleteModels(models: string[]): Chainable<any>;
      createContentModel(
        fields?: Fields | null | undefined,
        fieldData?: { [key: string]: any } | null | undefined,
        contentItems?: Item | null | undefined
      ): Chainable<any>;
      handleRetry(reload?: boolean, callBack?: () => void): Chainable<void>;
      setupInitialContentModel(): Chainable<{
        model: any;
        fields: any[];
        items: any[];
      }>;
      setFieldProperties(fields: Fields[]): Chainable<any[] | []>;
      setContentItemData(data: { [key: string]: any }): Chainable<any[] | []>;
      publishItem(modelZUID: string, itemZUID: string): Chainable<any>;
      unpublishItem(modelZUID: string, itemZUID: string): Chainable<any>;
      resetContentModel(): Chainable<void>;
    }
  }
}
