const ANNOUNCEMENTS_URL = "**/-/instant/6-90fbdcadfc-4lc0s5.json";

describe("Shell: Announcements", () => {
  beforeEach(() => {
    cy.clearCookie("READ_ANNOUNCEMENTS_ZUID");
  });

  const visitWith = (key) => {
    cy.fixture("announcements").then((announcements) => {
      // Registered after the global blockAnnouncements stub, so it takes precedence
      cy.intercept(ANNOUNCEMENTS_URL, { body: announcements[key] }).as(
        "announcements"
      );
    });
    cy.visit("/");
    cy.wait("@announcements");
  };

  [
    "blankEnd",
    "nullEnd",
    "missingEnd",
    "blankStart",
    "invalidDates",
    "startAfterEnd",
  ].forEach((key) => {
    it(`Renders the shell without a popup when the announcement has ${key}`, () => {
      visitWith(key);

      cy.getBySelector("InstanceMenuButton").should("exist");
      cy.getBySelector("AnnouncementPopup").should("not.exist");
    });
  });

  it("Shows the popup for a currently active announcement", () => {
    visitWith("active");

    cy.getBySelector("AnnouncementPopup").should("be.visible");
  });

  it("Shows the popup without crashing when feature_image has no data array", () => {
    visitWith("activeNoFeatureImageData");

    cy.getBySelector("InstanceMenuButton").should("exist");
    cy.getBySelector("AnnouncementPopup").should("be.visible");
  });
});
