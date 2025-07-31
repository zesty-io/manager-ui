const quotesFromApi = fetch(
  "https://www.zesty.io/-/instant/6-b4e8dbf8d8-kv87rx.json"
)
  .then((response) => response.json())
  .then((data) => {
    if (!!data.data?.length) {
      const englishQuotes = data.data.reduce((quotes, currentQuote) => {
        if (currentQuote.content.lang_id === "1") {
          quotes.push({
            quote: currentQuote.content.quote,
            quotee: currentQuote.content.author,
          });
        }

        return quotes;
      }, []);

      try {
        const quotesInLocalStorage = !!localStorage.getItem("zesty:quotes")
          ? JSON.parse(localStorage.getItem("zesty:quotes"))
          : [];

        // Makes sure locally saved loading quote data is synced with the dataset
        if (
          !quotesInLocalStorage.length ||
          quotesInLocalStorage.length !== englishQuotes.length
        ) {
          localStorage.setItem("zesty:quotes", JSON.stringify(englishQuotes));
        }
      } catch (err) {
        console.error("Failed to store quotes in localStorage: ", err);
      }
    } else {
      throw new Error("No quotes found in the response");
    }
  })
  .catch((error) => {
    console.error("Error fetching quotes from API: ", error);
  });

const instanceZUID = window.location.hostname.split(".")[0];
let quotes = [
  {
    quote: "Content is king.",
    quotee: "Bill Gates",
  },
];
try {
  const quotesInLocalStorage = localStorage.getItem("zesty:quotes")
    ? JSON.parse(localStorage.getItem("zesty:quotes"))
    : [];

  if (quotesInLocalStorage.length) {
    quotes = quotesInLocalStorage;
  }
} catch (err) {
  console.error("Failed to parse quotes from localStorage: ", err);
}

window.randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

const getFromIndexedDB = (key) => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open("zesty", 1);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("manager-ui", "readonly");
        const objectStore = transaction.objectStore("manager-ui");
        const getValue = objectStore.get(key);

        getValue.onerror = (event) => {
          reject(event.target.error);
        };

        getValue.onsuccess = (event) => {
          resolve(getValue.result);
        };
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("manager-ui")) {
          db.createObjectStore("manager-ui");
        }
      };
    } catch (err) {
      reject(err);
    }
  });
};
const getFromLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.error("Failed to get localStorage value:", err);
    return null;
  }
};
const appLocalStorageMap = {
  settings: "settingsNav",
  content: "contentNav",
  media: "mediaNav",
  apps: "appsNav",
  reports: "reportsNav",
  schema: "schemaNav",
  blocks: "blocksNav",
  code: "codeAppNav",
};

getFromIndexedDB(`${instanceZUID}:ui`)
  .then((uiState) => {
    if (!!uiState?.openNav || !uiState) {
      document
        .querySelector(".initial-loading-screen")
        ?.classList.remove("collapsed");
    } else {
      document
        .querySelector(".initial-loading-screen")
        ?.classList.add("collapsed");
    }
  })
  .catch((error) => {
    console.error("Failed to get IndexedDB value:", error);
  })
  .finally(() => {
    const openApp = window.location.pathname.split("/")[1];

    // Show/hide subapp nav depending on which app is open
    if (["", "launchpad", "leads", "redirects"].includes(openApp)) {
      if (document.querySelector(".subapp-sidebar")) {
        document.querySelector(".subapp-sidebar").style.display = "none";
      }
      if (document.querySelector(".subapp")) {
        document.querySelector(".subapp").style.gridTemplateAreas =
          '"topbar topbar" "quote quote"';
      }
    } else if (!!appLocalStorageMap[openApp]) {
      // Set subapp nav width and collapsed status based on localStorage value
      const appWidth = getFromLocalStorage(
        `zesty:resizableContainer:${appLocalStorageMap[openApp]}`
      );
      const appCollapsed = getFromLocalStorage(
        `zesty:collapsedContainer:${appLocalStorageMap[openApp]}`
      );

      if (appCollapsed === "true") {
        document.querySelector(".subapp-sidebar").style.display = "none";
        document.querySelector(".subapp").style.gridTemplateAreas =
          '"topbar topbar" "quote quote"';
      } else if (!!appWidth && Number(appWidth) !== 220) {
        document.querySelector(
          ".subapp"
        ).style.gridTemplateColumns = `${appWidth}px 1fr`;
      }
    }

    // Show the loading screen once indexedDB data is fetched
    if (document.querySelector(".initial-loading-screen")) {
      document.querySelector(".initial-loading-screen").style.display = "grid";
    }
  });
