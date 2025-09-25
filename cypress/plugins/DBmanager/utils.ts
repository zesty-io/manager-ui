import { join } from "path";
import { readFileSync } from "fs";

export function readJson(filePath): any {
  if (!filePath) return null;
  const isBrowser = !filePath?.includes("../../fixtures/");
  const normalizedUrl = isBrowser ? `../../fixtures/${filePath}` : filePath;
  const pathPart = normalizedUrl?.split("#");
  const path = pathPart?.[0];
  const target = pathPart?.[1];
  const fileContent = readFileSync(join(__dirname, path), "utf8");
  const parsedJSON = JSON.parse(fileContent);
  return !target ? parsedJSON : parsedJSON?.[target] || parsedJSON;
}

export function mapJsonValues(jsonData, context) {
  if (!jsonData) {
    return jsonData;
  }

  const jsonString =
    typeof jsonData !== "string" ? JSON.stringify(jsonData) : jsonData;
  const safeContext = context || {};

  const replaced = jsonString.replace(/{{(.*?)}}/g, (_, expr) => {
    try {
      const trimmedExpr = expr.trim();
      if (!trimmedExpr) {
        return `{{${expr}}}`;
      }

      return new Function(...Object.keys(safeContext), `return ${trimmedExpr}`)(
        ...Object.values(safeContext)
      );
    } catch (err) {
      return `{{${expr}}}`;
    }
  });

  return JSON.parse(replaced);
}
