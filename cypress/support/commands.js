import "./api";

Cypress.Commands.add("login", () => {
  const formBody = new FormData();

  formBody.append("email", Cypress.env("email"));
  formBody.append("password", Cypress.env("password"));

  return cy
    .request({
      url: `${Cypress.env("API_AUTH")}/login`,
      method: "POST",
      credentials: "include",
      body: formBody,
    })
    .then(async (res) => {
      const response = await new Response(res.body).json();
      // We need the cookie value returned reset so it is unsecure and
      // accessible by javascript
      cy.setCookie(Cypress.env("COOKIE_NAME"), response.meta.token);
    });
});

Cypress.Commands.add("blockLock", () => {
  cy.intercept("/door/knock*", (req) => {
    req.reply({});
  });
});

Cypress.Commands.add("waitOn", (path, cb) => {
  cy.intercept(path).as("waitingOn");
  cy.blockAnnouncements();
  cb();
  cy.wait("@waitingOn", {
    timeout: 30000,
  });
});

// The account CI signs in as is NOT staff, and Studio gates its interaction
// mode toggle on `user.staff` — so the toggle renders for nobody in CI and
// every spec that drives it fails on a missing element. Call this BEFORE
// cy.visit in specs that switch modes; the gate itself is covered in
// studio/mode-entitlement.spec.js, which stubs the flag the other way.
Cypress.Commands.add("stubStaffUser", () => {
  cy.intercept("GET", "**/v1/users/*", (req) => {
    req.continue((res) => {
      if (!res.body?.data) return;
      res.body.data = { ...res.body.data, staff: true };
    });
  }).as("getUserAsStaff");
});

// Post a test TEMPLATE_SOURCE_MAP only after the live bridge has posted its own.
Cypress.Commands.add("visitStudio", (path) => {
  cy.visit(`/studio?path=${path}`, {
    onBeforeLoad(win) {
      win.addEventListener("message", (e) => {
        // The live bridge posts from the preview origin; test posts from the app's.
        if (
          e.origin !== win.location.origin &&
          e.data?.source === "studio-bridge" &&
          e.data?.message?.type === "TEMPLATE_SOURCE_MAP"
        ) {
          win.__bridgeTemplateMapSeen = true;
        }
      });
    },
  });
});

Cypress.Commands.add("waitForBridgeTemplateMap", () => {
  cy.window().its("__bridgeTemplateMapSeen").should("eq", true);
});

Cypress.Commands.add("assertClipboardValue", (value) => {
  cy.window().then((win) => {
    win.navigator?.clipboard?.readText().then((text) => {
      expect(text).to.eq(value);
    });
  });
});

Cypress.Commands.add("getBySelector", (selector, ...args) => {
  return cy.get(`[data-cy="${selector}"]`, ...args);
});

Cypress.Commands.add("blockAnnouncements", () => {
  cy.intercept("/-/instant/6-90fbdcadfc-4lc0s5.json", (req) => {
    req.reply({});
  });
});

Cypress.Commands.add(
  "apiRequest",
  ({ method = "GET", url = "", body = undefined, ...otherOptions }) => {
    return cy.getCookie(Cypress.env("COOKIE_NAME")).then((cookie) => {
      const token = cookie?.value;
      return cy
        .request({
          url,
          method,
          headers: { authorization: `Bearer ${token}` },
          ...(body ? { body: body } : {}),
          ...otherOptions,
        })
        .then((response) => ({
          status: response?.isOkStatusCode ? "success" : "error",
          data: response?.body?.data,
        }));
    });
  }
);
