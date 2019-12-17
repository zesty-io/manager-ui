# Site Manager Application

Site Manager is comprised of several sub applications

## Architecture
The manager-app as been architected as a PWA using an app shell. Following closesly [Google's PRPL strategy](https://developers.google.com/web/fundamentals/performance/prpl-pattern/).

Every sub application has it's own bundle build. Application bundles are then pre cached dynamically by the app shell based upon the users settings.

### Dependencies

**TL;DR: Install all dependencies at the project root**

In order to avoid the confusion of sub-bundles specificying different versions that are actually included with our vendor bundle we've lifted all dependencies to the repo root. By lifiting all dependencies to the top level `package.json` we have a single location to manage dependency versions. 

This means all sub dependency declarations are resolved, per npm default behaviour of traversing up the project until it finds a `node_modules`, at the root `node_modules` directory.


**Notes**
- TinyMCE loads assets from our host. These will need to be available from this shell.
