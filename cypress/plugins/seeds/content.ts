import { readFileSync } from "fs";
import { join } from "path";
import SDK from "@zesty-io/sdk";

async function getAuthToken(): Promise<string> {
  const { email, password }: AuthCredentials = readJson(
    "../../cypress.env.json"
  );

  const formdata = new FormData();
  formdata.append("email", email);
  formdata.append("password", password);

  const requestOptions: RequestInit = {
    method: "POST",
    body: formdata,
  };

  const response = await fetch(`${config.env.API_AUTH}/login`, requestOptions);
  const jsonData: AuthResponse = await response.json();
  return jsonData?.meta?.token || "";
}

module.exports = async function setup(config) {
  const str = readFileSync(
    join(__dirname, "../../fixtures/content.json"),
    "utf8"
  );
  const json = JSON.parse(str);

  const token = getAuthToken(config);
  const sdk = new SDK(process.env.ZESTY_INSTANCE_ZUID, token, {
    accountsAPIURL: config.env.API_ACCOUNTS,
    authURL: config.env.API_AUTH,
    instancesAPIURL: "https://INSTANCE_ZUID.api.dev.zesty.io/v1",
    mediaAPIURL: "https://svc.dev.zesty.io",
  });

  // 1) Create Schema
  const model = await sdk.instance.createModel(json.model);

  // 2) Create Fields
  await Promise.all(
    json.fields.map((field) => {
      sdk.instance.createField(field);
    })
  );

  // 3) Create Item
  await sdk.instance.createItem(model.data.ZUID, json.items[0]);
};
