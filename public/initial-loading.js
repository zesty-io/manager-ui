const instanceZUID = window.location.hostname.split(".")[0];
const QUOTES = [
  {
    quote: "Content is king.",
    quotee: "Bill Gates",
  },
  {
    quote:
      "Marketing is no longer about the stuff that you make, but about the stories you tell.",
    quotee: "Seth Godin",
  },
  {
    quote: "Your brand is a story unfolding across all customer touchpoints.",
    quotee: "Jonah Sachs",
  },
  {
    quote: "The best marketing doesn't feel like marketing.",
    quotee: "Tom Fishburne",
  },
  {
    quote: "People don't buy what you do; they buy why you do it.",
    quotee: "Simon Sinek",
  },
  {
    quote:
      "If you can't explain it simply, you don't understand it well enough.",
    quotee: "Albert Einstein",
  },
  {
    quote: "The most powerful element in advertising is the truth.",
    quotee: "Bill Bernbach",
  },
  {
    quote:
      "A brand is no longer what we tell the consumer it is—it is what consumers tell each other it is.",
    quotee: "Scott Cook",
  },
  {
    quote: "Communication works for those who work at it.",
    quotee: "John Powell",
  },
  {
    quote:
      "The single biggest problem in communication is the illusion that it has taken place.",
    quotee: "George Bernard Shaw",
  },
  {
    quote: "The art of communication is the language of leadership.",
    quotee: "James Humes",
  },
  {
    quote:
      "Engage, enlighten, encourage, and especially…just be yourself! Social media is a community effort; everyone is an asset.",
    quotee: "Susan Cooper",
  },
  {
    quote:
      "The most powerful person in the world is the storyteller. The storyteller sets the vision, values, and agenda of an entire generation that is to come.",
    quotee: "Steve Jobs",
  },
  {
    quote:
      "Your brand is what people say about you when you're not in the room.",
    quotee: "Jeff Bezos",
  },
  {
    quote: "Great stories happen to those who can tell them.",
    quotee: "Ira Glass",
  },
  {
    quote: "No matter what you do, your job is to tell a story.",
    quotee: "Gary Vaynerchuk",
  },
];
const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
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
      document.querySelector(".subapp").style.gridTemplateAreas =
        '"topbar topbar" "quote quote"';
    } else if (!!appLocalStorageMap[openApp]) {
      // Set subapp nav width and collapsed status based on localStorage value
      const appWidth = getFromLocalStorage(
        `zesty:resizableContainer:${appLocalStorageMap[openApp]}`
      );
      const appCollapsed = getFromLocalStorage(
        `zesty:collapsedContainer:${appLocalStorageMap[openApp]}`
      );

      if (appCollapsed === "true") {
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
