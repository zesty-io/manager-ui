const OTHER_USER_ZUID = "5-0000000-otheruser";

// Load the list, then route to the item in-app so leaving it unmounts ItemEdit
const openItemInApp = (modelZUID, itemZUID) => {
  cy.visit(`/content/${modelZUID}`);
  cy.location("pathname").should("eq", `/content/${modelZUID}`);
  cy.window().then((win) => {
    win.history.pushState({}, "", `/content/${modelZUID}/${itemZUID}`);
    win.dispatchEvent(new win.PopStateEvent("popstate"));
  });
  cy.location("pathname").should("eq", `/content/${modelZUID}/${itemZUID}`);
};

const leaveItem = (modelZUID) => {
  cy.window().then((win) => win.history.back());
  cy.location("pathname").should("eq", `/content/${modelZUID}`);
};

describe("Content Item: Lock", () => {
  let modelZUID;
  let itemZUID;
  // What the stubbed lock service reports as the current holder
  let holder;

  before(() => {
    cy.task("seed:content", "fixtures/item.json").then(({ model, items }) => {
      modelZUID = model?.ZUID;
      itemZUID = items[0]?.meta?.ZUID;
    });
  });

  beforeEach(() => {
    cy.login();
    holder = {};

    cy.intercept("GET", "**/door/knock*", (req) => req.reply(200, holder)).as(
      "knock"
    );
    cy.intercept("POST", "**/door/lock", { statusCode: 200, body: {} }).as(
      "lock"
    );
    cy.intercept("GET", "**/door/unlock*", { statusCode: 200, body: {} }).as(
      "unlock"
    );
  });

  const holderAs = (userZUID) => ({
    userZUID,
    firstName: "Other",
    lastName: "User",
    email: "other.user@example.com",
    path: itemZUID,
    timestamp: `${Math.floor(Date.now() / 1000)}`,
  });

  it("Go Back does not release another user's lock", () => {
    holder = holderAs(OTHER_USER_ZUID);

    openItemInApp(modelZUID, itemZUID);
    cy.getBySelector("LockedItemGoBack").should("exist").click();
    cy.location("pathname").should("eq", `/content/${modelZUID}`);

    cy.get("@unlock.all").should("have.length", 0);
  });

  it("Releases the lock the current user holds when navigating away", () => {
    openItemInApp(modelZUID, itemZUID);
    cy.wait("@lock");

    // The service now reports the lock as held by the current user
    cy.window()
      .its("zestyStore")
      .invoke("getState")
      .its("user.ZUID")
      .then((userZUID) => {
        holder = holderAs(userZUID);
      });

    leaveItem(modelZUID);
    cy.wait("@unlock");
  });

  it("Keeps a lock taken over by another user when the previous holder navigates away", () => {
    openItemInApp(modelZUID, itemZUID);
    cy.wait("@lock");

    // Another user force-unlocks; this session isn't told about it
    holder = holderAs(OTHER_USER_ZUID);

    leaveItem(modelZUID);
    // First knock is the mount check, second is the release check
    cy.wait("@knock");
    cy.wait("@knock");

    cy.get("@unlock.all").should("have.length", 0);
  });

  after(() => {
    cy.deleteModel(modelZUID);
  });
});
