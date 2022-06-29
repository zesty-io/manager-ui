# Manager-UI Testing

> Notes on the cypress testing process

## Custom Commands

There are few custom commands we have created to simplify the process of writing tests against the manager-ui.

### `blockLock`

Zesty is a multitennant app with a lock feature that presents a modal when USER X is viewing the same resource as USER Y. This modal can layover UI being tested causing the default Cypress behavior of failing on interaction with out of view elements. We solve this by including this statement which intercepts the /door/knock API request and stubs an empty response, preventing the lock modal from displaying.

### `waitOn`

### `login`
