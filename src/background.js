"use strict";

import * as storage from "./js/storage.js";

chrome.runtime.onInstalled.addListener(init);
chrome.contextMenus.onClicked.addListener(onMenuClick);
chrome.runtime.onMessage.addListener(onMessageReceived);

let menu = [
  {
    id: "max",
    title: chrome.i18n.getMessage("option_max"),
    contexts: ["action"],
    type: "normal",
  },
  {
    id: "max_15",
    title: chrome.i18n.getMessage("option_max_15"),
    contexts: ["action"],
    parentId: "max",
    type: "radio",
  },
  {
    id: "max_25",
    title: chrome.i18n.getMessage("option_max_25"),
    contexts: ["action"],
    parentId: "max",
    type: "radio",
  },
  {
    id: "max_50",
    title: chrome.i18n.getMessage("option_max_50"),
    contexts: ["action"],
    parentId: "max",
    type: "radio",
  },
  {
    id: "max_100",
    title: chrome.i18n.getMessage("option_max_100"),
    contexts: ["action"],
    parentId: "max",
    type: "radio",
  },
  {
    id: "clear",
    title: chrome.i18n.getMessage("option_clear"),
    contexts: ["action"],
    type: "normal",
  },
];

async function init() {
  for (let item of menu) {
    await createMenuItem(item);
  }

  updateRadioControls();
}

async function updateRadioControls() {
  let maxClips = await storage.load("max-clips", 15);

  switch (maxClips) {
    case "15":
      await restoreCheckmark("max_15", true);
      break;
    case "25":
      await restoreCheckmark("max_25", true);
      break;
    case "50":
      await restoreCheckmark("max_50", true);
      break;
    case "100":
      await restoreCheckmark("max_100", true);
      break;
  }
}

function restoreCheckmark(id, bool) {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.update(
      id,
      {
        checked: bool,
      },
      function () {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
        resolve();
      }
    );
  });
}

function createMenuItem(item) {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.create(item, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }
      resolve();
    });
  });
}

async function onMenuClick(info) {
  let menuId = info.menuItemId;

  switch (menuId) {
    case "clear":
      await storage.clear("clips");
      break;
    case "max_15":
    case "max_25":
    case "max_50":
    case "max_100":
      let value = menuId.replace("max_", "");
      await storage.save("max-clips", value);
      await truncateClips();
      break;
  }
}

async function onMessageReceived(message) {
  switch (message.type) {
    case "clip":
      await updateClips(message.content);
      break;
  }
}

async function updateClips(clip) {
  let clips = await storage.load("clips", []);

  if (clip.length > 0) {
    clips.unshift(clip);
  }

  await storage.save("clips", clips);
  await truncateClips();
}

async function truncateClips() {
  let clips = await storage.load("clips", []);
  let maxClips = parseInt(await storage.load("max-clips", 15));

  console.log(clips, maxClips);

  if (clips.length > maxClips) {
    clips.length = maxClips;
  }

  await storage.save("clips", clips);
}
