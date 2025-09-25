import { BeforeRunScripts, CypressConfig } from "./types";
import { readJson } from "./utils";

const FILES_FOR_UPLOAD = [
  `/images/block_hero_side_by_side_image.png`,
  `/images/blocksOnboarding3.png`,
  `/images/sb__person__image__1.png`,
  `/images/sb__avatar__1.png`,
  `/images/zestyLogo.svg`,
  `/images/block_single_testimonial.png`,
  `/images/onboardingIcon.svg`,
  `/images/defaultImg.png`,
];

module.exports = async (
  on: Cypress.PluginEvents,
  config: CypressConfig,
  beforeRun: (fn: BeforeRunScripts, wait?: boolean) => void,
  store
) => {
  const { getAllMediaFiles, createBin, uploadBinFiles } = require("./services")(
    on,
    config
  );

  async function init() {
    const allFiles = await getAllMediaFiles();
    let binWithMostFiles = allFiles?.[0]?.files;

    // Create new bin if none exists or current one has insufficient files
    if (
      !binWithMostFiles ||
      binWithMostFiles.length < FILES_FOR_UPLOAD.length
    ) {
      const bin = await createBin("[E2E] : Media");
      binWithMostFiles = await uploadBinFiles(bin.id, FILES_FOR_UPLOAD);
    }

    const bin_id = binWithMostFiles?.[0]?.id || null;

    // Update config and store
    config.env.BIN_ID = bin_id;
    store.bin_id = bin_id;
    store.media = binWithMostFiles;
    store.common = {
      ...store.common,
    };

    return config;
  }

  async function getMediaBinFiles() {
    const allMediaFiles = await getAllMediaFiles();
    return allMediaFiles?.[0]?.files || [];
  }

  beforeRun(async () => {
    await init();
  });

  on("task", {
    "get:bin:files": getMediaBinFiles,
  });

  return config;
};
