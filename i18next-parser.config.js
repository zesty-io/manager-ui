module.exports = {
  locales: ["en-US", "es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL"],
  defaultNamespace: "common",
  defaultValue: "{{defaultValue}}",
  keepRemoved: false,
  output: "public/locales/$LOCALE/$NAMESPACE.json",
  input: ["src/**/*.{ts,tsx,js,jsx}"],
  namespaceSeparator: ".",
  keySeparator: false,
  pluralSeparator: "_",
};
