module.exports = class CleanupStatsPlugin {
  shouldPickStatChild(child) {
    return child.name.indexOf("mini-css-extract-plugin") !== 0;
  }

  apply(compiler) {
    compiler.hooks.done.tap("CleanUpStatsPlugin", stats => {
      const children = stats.compilation.children;
      if (Array.isArray(children)) {
        // eslint-disable-next-line no-param-reassign
        stats.compilation.children = children.filter(child =>
          this.shouldPickStatChild(child)
        );
      }
    });
  }
};
