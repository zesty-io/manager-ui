# Instance Manager Application

> The Cloud CMS for Marketers + Developers

## Architecture

The manager-ui has been architected following closesly [Google's PRPL strategy](https://developers.google.com/web/fundamentals/performance/prpl-pattern/). Every sub application has it's own bundle build. Application bundles are then pre cached dynamically by the app shell based upon the users settings.

Our long term vision is to add more Progressive Web App features over time.

![manager-ui-arcitecture](https://jvsr216n.media.zestyio.com/manager-ui-architecture.png)

### Dependencies

**TL;DR: Install all dependencies at the project root**

In order to avoid the confusion of sub-bundles specificying different versions that are actually included with our vendor bundle we've lifted all dependencies to the repo root. By lifiting all dependencies to the top level `package.json` we have a single location to manage dependency versions.

This means all sub dependency declarations are resolved, per npm default behaviour of traversing up the project until it finds a `node_modules`, at the root `node_modules` directory.

### Bundling

We use Webpack as our bundler of choice. There is a [single webpack config in the app shell](https://github.com/zesty-io/manager-ui/blob/master/src/shell/webpack.config.js) which, using lazy routes, separates the sub-apps into individual bundles.

## Development

When running this code base on your host machine to develop you will need to modify your host machines `/etc/hosts` file to point the DNS at your instances unique URL. With entry like this.

```
127.0.0.1 <YOUR_UNIQUE_INSTANCE_ZUID>.manager.zesty.io
```

This is necessary as network requests to remote resources will fail a Cross-Origin Resource Sharing (CORS) request otherwise. Once you have spoofed the DNS you can then load the URL `<YOUR_UNIQUE_INSTANCE_ZUID>.manager.zesty.io:8080` in your browser. This will then route through your localhost hitting the Webpack dev server but make network requests to remote services as the expected referrer.

**NOTE: Running the instance manager like this will still be hitting remote PRODUCTION resources. Meaning any actions you take will be done against your live instance.**

---

**Notes**
