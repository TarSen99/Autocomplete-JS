let input = document.querySelector(".main-form__input");
let hints_block = document.querySelector(".input-field__hints");
let selectedItemsUl = document.querySelector(".input-field-selected-items");

const generateHintsList = generateHintsDOM();
const showHintsWrapper = showHints(generateHintsList, 500);
const checkWhichBtnPressed = checkBtn();

input.addEventListener("focus", showHintsWrapper);
input.addEventListener("input", showHintsWrapper);
input.addEventListener("blur", toggleHintsBlockVisibility.bind(hints_block, "none"));
input.addEventListener("keydown", checkWhichBtnPressed);
document.addEventListener("keydown", addInputFocus);

function addInputFocus() {
  input.focus();
}

function checkBtn() {
  let keycodes = [37, 38, 39, 40, 13];

  return function(e) {
    for (let key of keycodes) {
      if (e.keyCode === key) {
        e.preventDefault();
        changeCurrentHintWithBtn(key);
        return;
      }
    }
  };
}

let changeCurrentHintWithBtn;

function getHintItemByKey(key, currItem) {
  if (!currItem) {
    return;
  }

  if (key === 37 || key === 38) {
    currItem = currItem.previousElementSibling;

    if (!currItem) {
      return hints_block.lastElementChild;
    }
  } else if (key === 39 || key === 40) {
    currItem = currItem.nextElementSibling;

    if (!currItem) {
      return hints_block.firstElementChild;
    }
  } else if (key === 13) {
    addListItems(currItem);
    generateHintsList(" ");
  }

  return currItem;
}

function changeStateOfHintsList() {
  let currentItem = hints_block.firstElementChild;
  setNewItemStyle(currentItem);

  return function(key) {
    if (!currentItem) {
      return;
    }

    currentItem = getHintItemByKey(key, currentItem);
    setNewItemStyle(currentItem);
  };
}

function setNewItemStyle(itemToSetNewClass) {
  if (!itemToSetNewClass) {
    return;
  }

  removeStyleFromHintsList();

  itemToSetNewClass.classList.add("input-field__hint_active");
}

hints_block.addEventListener("mouseover", removeStyleFromHintsList);

function removeStyleFromHintsList() {
  let items = [...hints_block.children];

  items.forEach(item => {
    item.classList.remove("input-field__hint_active");
  });
}

function generateHintsDOM() {
  let getHintsArr = getHintsArray();

  return function(param) {
    let valueTiFind = param;
    let hintsArr = getHintsArr(valueTiFind);
    hints_block.innerHTML = "";

    if (hintsArr.length === 0) {
      return;
    }

    hintsArr.forEach(item => {
      hints_block.insertAdjacentHTML(
        "beforeend",
        `<li class="input-field__hint"> ${item}</li>`
      );
    });

    toggleHintsBlockVisibility.call(hints_block, 'block');
    changeCurrentHintWithBtn = changeStateOfHintsList();
  };
}

function toggleHintsBlockVisibility(param) {
  let currentBlockState = param ;

  this.style.display = currentBlockState;
}

function showHints(generateHints, delay) {
  let currentTimedId;

  return function(event) {
    if (currentTimedId) {
      clearTimeout(currentTimedId);
    }

    currentTimedId = setTimeout(generateHints.bind(hints_block, event.target.value), delay);
  };
}

function getHintsArray() {
  let hintsArray = ["Apple", "Lemon", "Lime", "Orange", "Strawberry"];

  return function(valueToFind) {
    valueToFind = valueToFind.toLowerCase();
    valueToFind = valueToFind.trim();

    if (!valueToFind) {
      return hintsArray;
    }

    let existingHints = [];

    hintsArray.forEach(item => {
      if (item.toLowerCase().indexOf(valueToFind) === 0) {
        existingHints.push(item);
      }
    });

    return existingHints;
  };
}

function applyPositionToActiveListItem(activeListItems, item) {
  let currentListItem;

  if (item) {
    currentListItem = item;
  } else {
    currentListItem = activeListItems.lastElementChild;
  }

  let distanceBetweenItems = 0;
  const requireDistanceBetweenItems = 10;
  let prevListItem = currentListItem.previousElementSibling;
  let prevListItemWidth = 0;
  let prevListItemX = 0;

  const inputX = input.getBoundingClientRect().left;
  const inputWidth = input.clientWidth;

  if (prevListItem) {
    prevListItemWidth = prevListItem.clientWidth;
    prevListItemX = parseInt(prevListItem.style.left);
    distanceBetweenItems = requireDistanceBetweenItems;
  }

  let currItemPosX = prevListItemX + prevListItemWidth + distanceBetweenItems;
  let currItemWidth = currentListItem.clientWidth + requireDistanceBetweenItems;

  if (inputX + currItemPosX + currItemWidth > inputX + inputWidth) {
    return;
  }

  currentListItem.style.left = `${currItemPosX}px`;

  return {
    currX: currItemPosX,
    currWidth: currItemWidth
  };
}

const addListItems = addItemsToList();
hints_block.addEventListener("mousedown", toggleItemsList);
selectedItemsUl.addEventListener("click", toggleItemsList);

function toggleItemsList(e) {
  if (e.target.closest(".input-field-selected-item__btn")) {
    removeItemFromList.call(e);
  } else if (e.target.matches(".input-field__hint")) {
    addListItems.call(e);
  }
}

const changeInput = setInputSettings();

function configureListItems(
  lastItemParams,
  currNumberListElements,
  deleteConfirmation
) {
  //remove element if it doesn't fit to input
  if (!lastItemParams && currNumberListElements > 0 && deleteConfirmation) {
    selectedItemsUl.removeChild(selectedItemsUl.lastElementChild);
    return;
  }

  changeInput(lastItemParams, currNumberListElements);
}

function removeItemFromList() {
  let bthParent = this.target.closest(".input-field-selected-item");
  let removedItemPosX = bthParent.getBoundingClientRect().left;
  let positionToRemove = parseInt(bthParent.dataset.pos);
  bthParent.remove();

  let restButtons = [...selectedItemsUl.children];

  if (restButtons.length === 0) {
    configureListItems(null, 0);

    return;
  }

  //if we deleted last element in list
  if (positionToRemove === restButtons.length) {
    let lastListItem = selectedItemsUl.lastElementChild;
    let lastListItemX = lastListItem.getBoundingClientRect().left;
    let lastListItemW = lastListItem.clientWidth;
    let distBetweenItems = removedItemPosX - lastListItemX - lastListItemW;

    let itemParams = {
      currX: parseInt(lastListItem.style.left),
      currWidth: lastListItemW + distBetweenItems
    };

    configureListItems(itemParams, restButtons.length);

    return;
  }

  restButtons.forEach(item => {
    if (parseInt(item.dataset.pos) > positionToRemove) {
      let currentItemParams = applyPositionToActiveListItem(null, item);
      item.dataset.pos = parseInt(item.dataset.pos) - 1;
      configureListItems(currentItemParams, restButtons.length);
    }
  });
}

function addItemsToList() {
  let activeListItems = document.querySelector(".input-field-selected-items");

  return function(item) {
    let target = this.target || item;
    let currNumberListElements = activeListItems.children.length;

    activeListItems.insertAdjacentHTML(
      "beforeend",
      `<li class="input-field-selected-item"
                   data-pos="${currNumberListElements}">
                       <span class="input-field-selected-item__text">
                             ${target.innerText}
                       </span>
                       <span class="input-field-selected-item__btn">
                            <img src="img/exit-icon.png">
                       </span>
                  </li>`
    );

    let lastItemParams = applyPositionToActiveListItem(activeListItems);
    //true - confirm to delete last element that doesn't feet
    configureListItems(lastItemParams,
        currNumberListElements + 1, true);
  };

}

function setInputSettings() {
  let label = document.querySelector(".main-form__label");

  return function(lastItemParams, activeItemsCount) {
    modifyInputLabelPosition(label, activeItemsCount);

    let itemX;
    let itemWidth;

    if (lastItemParams) {
      itemX = lastItemParams.currX;
      itemWidth = lastItemParams.currWidth;
    } else {
      itemX = 0;
      itemWidth = 0;
    }

    let caretPosition = itemX + itemWidth;
    input.value = "";
    input.style.paddingLeft = `${caretPosition}px`;
  };
}

function modifyInputLabelPosition(label, activeItemsCount) {
  if (activeItemsCount) {
    label.classList.add("main-form__label-active");
  } else {
    label.classList.remove("main-form__label-active");
  }
}
