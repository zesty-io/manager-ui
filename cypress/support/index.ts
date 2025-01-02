import "./commands";

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
    }
  }
}
