/*****  Animate on Scroll    *********/

const blog = document.querySelector("#blog");
const blogPost = document.querySelector(".blog-post");
const videos = document.querySelector("#videos");
const notes = document.querySelectorAll(".notes");

// Debounce for animation scrolling
function debounce(func, wait = 20, immediate = true) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function blogFade() {
  const trigAt = window.scrollY + window.innerHeight;
  if (trigAt > blog.offsetTop) {
    blogPost.classList.add("blog-post-fadein");
  }
}

function videoIcons() {
  const trigAt = window.scrollY + window.innerHeight;
  if (trigAt > videos.offsetTop) {
    notes.forEach(note => note.classList.add("notes-anim"));
  }
}

window.addEventListener("scroll", debounce(blogFade));
window.addEventListener("scroll", debounce(videoIcons));

/***** GALLERY ***********/

const wrapper = document.querySelector(".wrapper");
const figs = document.querySelectorAll(".sect-gallery figure");
const overlay = document.querySelector(".overlay");
const modal = document.querySelector(".modal");
const modalImg = modal.querySelector("img");
const modalHdg = modal.querySelector("h3");
const closeBtn = modal.querySelector(".btn-close");
let focusedElementBeforeOverlay;

// Open modal and get its img src and caption, save current focus, hide rest of body from AT
function openOver(e) {
  // Save current focus
  focusedElementBeforeOverlay = document.activeElement;
  if (e.target.classList.contains("btn-fig")) {
    modalImg.src = this.querySelector("img").src;
    modalHdg.textContent = this.querySelector(".fig-cap").textContent;
    overlay.classList.add("open");
    closeBtn.focus();
    wrapper.setAttribute("aria-hidden", true);

    // Listen for and trap the keyboard
    modal.addEventListener("keydown", trapTabKey);
  }
}

function trapTabKey(e) {
  // Check for TAB key press
  if (e.keyCode === 9) {
    e.preventDefault();
    closeBtn.focus();
  }

  // ESC key
  if (e.keyCode === 27) {
    closeOverlay();
  }
}

function closeOverlay() {
  overlay.classList.remove("open");
  // Set focus back to element that had it before the modal was opened
  focusedElementBeforeOverlay.focus();
  wrapper.removeAttribute("aria-hidden");
}

figs.forEach(fig => fig.addEventListener("click", openOver));
closeBtn.addEventListener("click", closeOverlay);

/*****  WISH LIST   *****/

// Add DOM Vars and Listeners
const form = document.querySelector("#wish-form");
const wishList = document.querySelector("#wish-list h2");
const list = document.querySelector("#wish-list-items");
const clearCont = document.querySelector("#clear-cont");
const input = document.querySelector("#add-input");
const liveRegion = document.querySelector("#wish-list .live");
clearCont.addEventListener("click", clearList);
form.addEventListener("submit", getItem);
list.addEventListener("click", editItem);

//	Array containing list item text elems
let arr = JSON.parse(localStorage.getItem("arr")) || [];
render(); // initial display of list items on page load

// ARIA live readout and cancel after 2 seconds
function ariaLive(msg) {
  liveRegion.textContent = msg;
  wishList.focus();
  setTimeout(() => {
    liveRegion.textContent = "";
  }, 2000);
}

function store() {
  localStorage.setItem("arr", JSON.stringify(arr));
}

// Get text from form and push into array
function getItem(e) {
  e.preventDefault();
  let text = input.value;
  if (text === "") {
    ariaLive(`please enter valid text`);
    return;
  }

  ariaLive(`${text} added to list`);
  arr.push(text);
  form.reset();
  render();
  store();
  input.focus();
}

// Clear all list items
function clearList(e) {
  if (e.target === document.querySelector("#btn-clear")) {
    if (!confirm("Do you want to delete all list items?")) return;
    arr = [];
    store();
    render();
    ariaLive(`all list items deleted`);
  }
}

// Generate Dynamic List Items to DOM
function render() {
  let listItems = "";
  arr.forEach(text => {
    return (listItems += `<li class="box"><div class="item" draggable="true"><span class="text">${text}</span><button class="btn btn-tgl" aria-expanded="false" aria-label="edit list item menu"><i class="open icon ion-ios-menu"></i><i class="close icon ion-ios-close"></i></button><ul class="edit-btns-cont" role="menu"><li><button class="btn top" aria-label="move to top of list">top</button></li><li><button class="btn btm" aria-label="move to end of list">end</button></li><li><button class="btn delete" aria-label="delete"><i class="icon ion-ios-trash"></i></button></li></ul></div></li>`);
  });
  list.innerHTML = listItems;
  dragListen(); // add drag listeners to new items

  // display Clear button
  if (arr.length > 0) {
    clearCont.innerHTML = `<button id="btn-clear" aria-label="clear all list items">Clear All</button>`;
  } else {
    clearCont.innerHTML = "";
  }

  wishList.focus();
}

// Dynamic Wish List Individual Item Edit Buttons
function editItem({ target }) {
  let item = target;
  if (!item.classList.contains("btn-tgl")) {
    moveItem(item);
  } else {
    editMenuTgl(item);
  }
}

function moveItem(item) {
  let val = item.parentElement.parentElement.parentElement
    .querySelector(".text")
    .innerText.trim();

  if (item.classList.contains("delete")) delItem(item);
  if (item.classList.contains("top")) topItem(item);
  if (item.classList.contains("btm")) btmItem(item);

  function delItem(item) {
    arr.forEach((el, index) => {
      if (el === val) {
        arr.splice(index, 1);
      }
    });
    ariaLive(`${val} deleted from list`);
  }

  function topItem(item) {
    arr.forEach((el, index) => {
      if (el === val) {
        let newTop = arr.splice(index, 1);
        arr = [...newTop, ...arr];
      }
    });

    ariaLive(`${val} moved to top of list`);
  }

  function btmItem(item) {
    arr.forEach((el, index) => {
      if (el === val) {
        let newBtm = arr.splice(index, 1);
        arr = [...arr, ...newBtm];
      }
    });

    ariaLive(`${val} moved to bottom of list`);
  }
  render();
  store();
}

// individual list item edit menu
function editMenuTgl(item) {
  const expanded = item.getAttribute("aria-expanded") === "true" || false;
  item.setAttribute("aria-expanded", !expanded);
  const contBtns = item.parentElement.parentElement.querySelector(
    ".edit-btns-cont"
  );

  // navigate edit menu with keyboard
  const editBtns = [...contBtns.querySelectorAll("button")];
  contBtns.classList.toggle("show");
  editBtns[0].focus();
  list.addEventListener("keydown", function(e) {
    let active = document.activeElement;
    const len = editBtns.length - 1;
    if (e.keyCode === 39 || e.keyCode === 40) {
      e.preventDefault();
      if (active === editBtns[len]) {
        editBtns[0].focus();
      } else {
        editBtns[editBtns.indexOf(active) + 1].focus();
      }
    }
    if (e.keyCode === 37 || e.keyCode === 38) {
      e.preventDefault();
      if (active === editBtns[0]) {
        editBtns[len].focus();
      } else {
        editBtns[editBtns.indexOf(active) - 1].focus();
      }
    }
    if (e.keyCode === 27) {
      item.focus();
      editMenuTgl(item);
    }
  });
}

// Add List Drag Item Listeners
function dragListen() {
  const items = list.querySelectorAll(".item");
  const boxes = list.querySelectorAll(".box");

  for (const item of items) {
    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragend", dragEnd);
  }

  for (const box of boxes) {
    box.addEventListener("dragover", dragOver);
    box.addEventListener("drop", dragDrop);
  }
}

// Drag Functions
let dragItemText;
let dragItemIndex;
let destItemText;
let destTextIndex;

// for draggable item
function dragStart(e) {
  dragItemText = e.target.childNodes[0].textContent.trim();
  arr.forEach((el, index) => {
    if (el === dragItemText) {
      dragItemIndex = index;
    }
  });
  this.className += " hold";
  setTimeout(() => (this.className = "invisible"), 0);
}

// for draggable item
function dragEnd() {
  arr.forEach((el, index) => {
    if (el === destItemText) {
      destTextIndex = index;
    }
  });
  arr.splice(dragItemIndex, 1);
  arr.splice(destTextIndex, 0, dragItemText);
  render();
  store();
}

// for box containing item
function dragOver(e) {
  e.preventDefault();
}

// for box containing item
function dragDrop(e) {
  destItemText = e.srcElement.childNodes[0].textContent.trim();
}

// Countdown Birthday Timer

(function counter() {
  const birthday = document.querySelector(".birthday");
  const christmas = document.querySelector(".christmas");
  let yearB = 2019;
  let yearC = 2019;

  let time = setInterval(function() {
    let birth = new Date(yearB, 6, 17).getTime();
    let christ = new Date(yearC, 11, 25).getTime();
    let now = new Date().getTime();
    let bdays = Math.ceil((birth - now) / (1000 * 60 * 60 * 24));
    let cdays = Math.ceil((christ - now) / (1000 * 60 * 60 * 24));
    if (bdays < 0) yearB++;
    if (cdays < 0) yearC++;
    birthday.textContent = bdays;
    christmas.textContent = cdays;
  }, 1000);
})();

/*****  FOOTER   ******/

// Pause logo animation and its tooltip
const skbButton = document.querySelector(".btn-skb");
const skbImg = document.querySelector(".footer-skb");
skbButton.addEventListener("click", togAnim);
skbButton.addEventListener("mouseup", hideTool);

function togAnim() {
  skbImg.classList.toggle("stop-anim");
}

// Hide tooltip after button click for mouse users
function hideTool() {
  skbButton.blur();
}

/*******  TESTING **************/

// document.addEventListener("keydown", () => {
//   console.log(document.activeElement);
// });
