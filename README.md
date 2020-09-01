# Instance Manager Application
> The Cloud CMS for Marketers + Developers

## Architecture
The manager-ui has been architected following closesly [Google's PRPL strategy](https://developers.google.com/web/fundamentals/performance/prpl-pattern/). Every sub application has it's own bundle build. Application bundles are then pre cached dynamically by the app shell based upon the users settings.

Our long term vision is to add more Progressive Web App features over time.

### Dependencies

**TL;DR: Install all dependencies at the project root**

In order to avoid the confusion of sub-bundles specificying different versions that are actually included with our vendor bundle we've lifted all dependencies to the repo root. By lifiting all dependencies to the top level `package.json` we have a single location to manage dependency versions. 

This means all sub dependency declarations are resolved, per npm default behaviour of traversing up the project until it finds a `node_modules`, at the root `node_modules` directory.

### Bundling

We use Webpack as our bundler of choice. There is a [single webpack config in the app shell](https://github.com/zesty-io/manager-ui/blob/master/src/shell/webpack.config.js) which, using lazy routes, separates the sub-apps into individual bundles.

---

**Notes**
