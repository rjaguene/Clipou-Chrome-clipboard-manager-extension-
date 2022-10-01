"use strict";

document.addEventListener("copy", onCopy);

function onCopy() {
  let activeEl = document.activeElement;
  let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;

  if (activeElTagName === "input" && activeEl.type === "password") {
    return;
  }

  let sel = window.getSelection().toString().trim();

  sendMessage({ type: "clip", content: sel });
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}
