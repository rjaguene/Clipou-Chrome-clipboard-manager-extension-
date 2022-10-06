"use strict";

import * as storage from "./storage.js";

let listNavItems;
let navIndex;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await loadData();
  setupNavigation();
  setupListeners();
}

async function loadData() {
  let data = await storage.load("clips", []);
  renderList(data);
}

function renderList(data) {
  let list = document.getElementById("list");

  data.forEach((item, i) => {
    let li = document.createElement("li");
    let text = document.createElement("span");
    let key = document.createElement("span");

    li.setAttribute("data-value", item);
    li.setAttribute("title", item);
    li.classList.add("item", "nav-index");

    text.innerText = item.replace(/\n/, " ");
    text.classList.add("content");

    li.appendChild(text);

    if (i < 9) {
      key.innerText = i + 1;
      key.classList.add("key");
      li.appendChild(key);
    }

    list.appendChild(li);
  });
}

function setupListeners() {
  let navItems = document.querySelectorAll(".nav-index");

  for (let item of navItems) {
    item.addEventListener("click", onNavItemClicked);
  }

  document.addEventListener("keydown", documentOnKeydown, false);
  document.addEventListener("mouseout", documentOnMouseout, false);
}

async function onNavItemClicked(e) {
  let target = e.target;
  let value = target.dataset.value;
  await copyToClipboard(value);
  showListClickFeedback();
}

function showListClickFeedback() {
  let interval = 100;

  setTimeout(() => {
    listNavItems[navIndex].classList.remove("selected");
  }, 0);

  setTimeout(() => {
    listNavItems[navIndex].classList.add("selected");
  }, interval);

  setTimeout(() => {
    listNavItems[navIndex].classList.remove("selected");
  }, interval * 2);

  setTimeout(() => {
    listNavItems[navIndex].classList.add("selected");
  }, interval * 3);

  setTimeout(() => {
    window.close();
  }, interval * 4);
}

async function copyToClipboard(value) {
  await navigator.clipboard.writeText(value);
}

function documentOnKeydown(e) {
  if (e.key >= "1" && e.key <= "9") {
    clickItemByIndex(e.key - 1);
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    navigateDirection(e);
  } else if (e.key === "Enter") {
    clickSelectedItem();
  } else if (e.key === "Backspace" && listNavItems[navIndex].dataset.id) {
    deleteSelectedDocument();
  }
}

function documentOnMouseout(e) {
  removeAllSelections();
  navIndex = null;
}

function setupNavigation() {
  listNavItems = document.querySelectorAll(".nav-index");

  for (let [i, item] of listNavItems.entries()) {
    item.addEventListener(
      "mouseover",
      function (e) {
        removeAllSelections();
        navIndex = null;
        this.classList.add("selected");
        navIndex = i;
      },
      false
    );
  }
}

function navigateDirection(e) {
  e.preventDefault();

  switch (e.key) {
    case "ArrowDown":
      setNavIndex();
      navigateListDown();
      break;
    case "ArrowUp":
      setNavIndex();
      navigateListUp();
      break;
  }

  if (navIndex <= 0) scrollToTop();
  if (navIndex >= listNavItems.length - 1) scrollToBottom();

  listNavItems[navIndex].classList.add("selected");
  listNavItems[navIndex].scrollIntoView({ block: "nearest" });
}

function setNavIndex() {
  if (!navIndex) {
    navIndex = 0;
  }
}

function navigateListDown() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== listNavItems.length - 1 ? navIndex++ : listNavItems.length - 1;
  } else {
    navIndex = 0;
  }
}

function navigateListUp() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== 0 ? navIndex-- : 0;
  } else {
    navIndex = listNavItems.length - 1;
  }
}

function clickItemByIndex(index) {
  removeAllSelections();
  let el = listNavItems[index];

  if (el) {
    navIndex = index;
    el.click();
  }
}

function clickSelectedItem(e) {
  let el = listNavItems[navIndex];
  el.click();
}

function removeAllSelections() {
  for (let item of listNavItems) {
    item.classList.remove("selected");
  }
}

function scrollToTop() {
  window.scrollTo(0, 0);
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}
