<div style="text-align:center;">
  <img title="Logo for Zesty.io" width="300px" height="72px" src="https://brand.zesty.io/zesty-io-logo-horizontal.png" />  
</div>

<br />

**[Start by creating a free instance](https://start.zesty.io/)**

You have found the code base which powers the Zesty.io instance manager. While this code base can be run locally it is only recommended to do so for developing. If you would like to learn more about Zesty.io visit our [documentation at zesty.org](https://zesty.org/)

# Architecture

The manager-ui has been architected following the [PRPL strategy](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) described by [Houssein Djirdeh](https://twitter.com/hdjirdeh) at Google. Every sub application has it's own bundle build. Application bundles are then pre cached dynamically by the app shell based upon the users settings.

![Diagram showing Zesty.io instance manager architecture](https://jvsr216n.media.zestyio.com/manager-ui-architecture.png)

## Dependencies

**TL;DR: Install all dependencies at the project root**

In order to avoid the confusion of sub-app bundles specificying different versions that are actually included with the vendor bundle all dependencies have been lifted to the repo root. By lifiting all dependencies to the top level `package.json` we have a single location to manage dependency versions.

This means all sub dependency declarations are resolved, per npm default behaviour, by traversing up the project until it finds tehe `node_modules` directory at the root.

## Bundling

Webpack is used as the bundler of choice. There is a [single webpack config in the app shell](https://github.com/zesty-io/manager-ui/blob/master/src/shell/webpack.config.js) which, using lazy routes, separates the sub-apps into individual bundles.

## State Management

A redux store is used to manage state across all of the potential sub-apps. The shell setups a global store which is then shared to sub-apps that can dynamically inject reducers if needed.

# Development

## Requirements

- Node.js version 12 LTS
- Web browser: Chrome / Firefox / Edge / Safari (latest)
- Redux DevTools Extension - https://github.com/zalmoxisus/redux-devtools-extension

## Using Redux DevTools Extension

1. Install Redux DevTools Extension
2. Click on Redux DevTools icon in browser (or right click and open in new window)
3. View sequence of Redux Actions and other features like state diffs and rewind.

## Modify your hosts file

Every instance has a Zesty Universal ID (ZUID) which uniquely identifies itself to the API. When running the instance manager on your host machine you will need to point the unique instance URL to your host machines localhost by editing your hosts file. This is necessary as network requests to remote resources will fail a Cross-Origin Resource Sharing (CORS) request otherwise. This will then route through your localhost hitting the Webpack dev server and then make network requests to remote services as the expected referrer.

**NOTE: Running the instance manager locally still connects to remote PRODUCTION resources. Meaning any actions you take will be done against your live instance.**

_e.g. linux: `/etc/hosts`_

```
127.0.0.1 <YOUR_UNIQUE_INSTANCE_ZUID>.manager.zesty.io
```

## Start the application

1. Install dependencies: `npm install`
2. Start webpack: `npm run serve:webpack -- --env.NODE_ENV=production`
3. Load the app in your browser: `<YOUR_UNIQUE_INSTANCE_ZUID>.manager.zesty.io:8080`

---

**Notes**
