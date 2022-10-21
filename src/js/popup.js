"use strict";

import * as storage from "./storage.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await loadData();
  setupListeners();
  setFav();
}

async function loadData() {
  let data = await storage.load("clips", []);
  let dataFav = await storage.load("clipsFavv", []);
  renderList(dataFav);
  renderList(data);
}

function renderList(data) {
  const uniq = [...new Set(data)];

  uniq.forEach((item, i) => {

    const container = document.createElement("div");
    container.classList.add('elements', 'line');
    container.id = 'asset_touchbox';

    let txt = document.createElement('p');
    txt.classList.add("txt");

    txt.innerHTML = item.slice(0, 125);
    if (item.length >= 175){
      txt.innerHTML += '...';
    }
    let icon1 = document.createElement('img');
    icon1.setAttribute("data-value", item);
    icon1.setAttribute("title", item);
    icon1.classList.add("item", "copyBtn");
    icon1.src = '../images/CopyIcon.png';

    let icon2 = document.createElement('img');
    icon2.setAttribute("data-value", item);
    icon2.setAttribute("title", item);
    icon2.classList.add("item", "elemFav");
    icon2.src = '../images/FavIconOff.png';
    icon2.id = item;

    let icon3 = document.createElement('img');
    icon3.setAttribute("data-value", item);
    icon3.setAttribute("title", item);
    icon3.classList.add("item", "elemDelete");
    icon3.src = '../images/DeleteIcon.png';

    container.appendChild(txt);
    container.appendChild(icon1);
    container.appendChild(icon2);
    container.appendChild(icon3);

    document.querySelector('#root').appendChild(container);
  });
}

function setupListeners() {
  let navItems = document.querySelectorAll(".copyBtn");
  let favItem = document.querySelectorAll(".elemFav");
  let deleteItems = document.querySelectorAll(".elemDelete");

  for (let item of navItems) {
    item.addEventListener("click", onNavItemClicked);
  }

  for (let itemDel of deleteItems) {
    itemDel.addEventListener("click", onNavItemClickedDelete);
  }

  for (let fav of favItem) {
    fav.addEventListener("click", onNavItemClickedFav);
  }
}

async function setFav() {
  let data = await storage.load("clipsFavv", []);

  data.forEach(item => {
    document.getElementById(item).src = '../images/FavIconOn.png';
  })
}

async function onNavItemClickedFav(e) {
  let target = e.target;
  let value = target.dataset.value;

  document.getElementById(value).src = '../images/FavIconOn.png'


  let data = await storage.load("clipsFavv", []);
  let data2 = await storage.load("clips", []);

  if (value.length > 0 && data.includes(value) == false) {
    data.unshift(value);
    await storage.save("clipsFavv", data);

    let newarr = data2.filter(a => a !== value)
    storage.save("clips", newarr);
  } else {
    let newarr = data.filter(a => a !== value)
    await storage.save("clipsFavv", newarr);
    data2.unshift(value);
    await storage.save("clips", data2);
  }
  document.getElementById("root").innerHTML = "";
  init()
}

async function onNavItemClickedDelete(e) {
  let target = e.target;
  let value = target.dataset.value;
  let data = await storage.load("clips", []);
  let dataFav = await storage.load("clipsFavv", []);

  let newarr = data.filter(a => a !== value)
  let newarrFav = dataFav.filter(a => a !== value)
  storage.save("clips", newarr);
  storage.save("clipsFavv", newarrFav);
  document.getElementById("root").innerHTML = "";
  init()
}

async function onNavItemClicked(e) {
  let target = e.target;
  let value = target.dataset.value;
  await copyToClipboard(value);
  showListClickFeedback();
}

function showListClickFeedback() {
  let interval = 150;

  setTimeout(() => {
    document.getElementById("copy").style.display = "block";
  }, interval * 1);
  setTimeout(() => {
     window.close();
  }, interval * 4);
}

async function copyToClipboard(value) {
  await navigator.clipboard.writeText(value);
}
