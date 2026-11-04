declare module "*.less";
declare module "@zesty-io/core/*";
declare module "zuid";
declare module "js-beautify" {
  export function html(
    source: string,
    options?: { indent_size?: number }
  ): string;
}
