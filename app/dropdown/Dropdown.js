import './Dropdown.styl';
import template from 'lodash/template';
import isEqual from 'lodash/isEqual';
import dropdownTPL from './dropdown.tpl';
import dropdownListItemsTPL from './dropdownListItems.tpl';
import { indexOptions, filter, removeSelected } from './dropdownHelpers';
import ajax from '../lib/ajax';
const parsedDropdownListItemsTPL = template(dropdownListItemsTPL);

export default class Dropdown {
  constructor(element, options, userConfig = {}) {

    const baseConfig = {
      withApi: false,
      apiUrl: '/api.php',
      noAvatar: false,
      autocomplete: true,
      multiSelect: true,
      placeholder: 'Введите имя друга или id',
      indexWordLength: 3
    };

    this.config = { ...baseConfig, ...userConfig };

    // index options for simplify search
    this._indexedOptions = indexOptions(options, this.config.indexWordLength);

    this._element = document.querySelector(element);

    this._classes = {
      listItemActive: 'dropdown-list__item--active',
      listItem: 'js-dropdown-item',
      listOpen: 'dropdown-list--open',
      listShow: 'dropdown-list__item--show',
      dropdownSelectedItem: 'dropdown-selected__item',
      dropdownSelectedSingle: 'dropdown-selected__single',
      dropdownSelectedClose: 'dropdown-selected__close',
      dropdownSelectedAvatar: 'dropdown-selected-avatar',
      dropdownOpen: 'dropdown--open',
      dropdown: 'js-dropdown',
      dropdownArrow: 'js-dropdown-arrow',
      dropdownList: 'js-dropdown-list',
      dropdownInput: 'js-dropdown-input',
      dropdownSelectedAvatars: 'js-dropdown-avatars',
      dropdownSelected: 'js-dropdown-selected'
    };

    this._currentValue = '';
    this._filteredResult = [];
    this._selected = {};

    this._init();

  }

  _init() {
    this._element.innerHTML = template(dropdownTPL)({
      readonly: !this.config.autocomplete,
      placeholder: this.config.placeholder
    });
    this._cacheElements();
    this._initFilterResults();
    this._addHandlers();
  }

  _renderListItems() {
    this._elements.dropdownList.innerHTML = parsedDropdownListItemsTPL({
      items: this._filteredResult,
      itemsById: this._indexedOptions.byId,
      noAvatar: this.config.noAvatar
    });
    [].forEach.call(this._elements.dropdownList.querySelectorAll(`.${this._classes.listItem}`), el => {
      el.onclick = this._onSelect;
      el.onmouseenter = this._setActive;
      el.onmouseleave = this._removeActive;
    })
  }

  _cacheElements() {
    this._elements = {
      dropdown: this._element.querySelector(`.${this._classes.dropdown}`),
      dropdownArrow: this._element.querySelector(`.${this._classes.dropdownArrow}`),
      dropdownList: this._element.querySelector(`.${this._classes.dropdownList}`),
      dropdownInput: this._element.querySelector(`.${this._classes.dropdownInput}`),
      dropdownSelectedAvatars: this._element.querySelector(`.${this._classes.dropdownSelectedAvatars}`),
      dropdownSelected: this._element.querySelector(`.${this._classes.dropdownSelected}`)
    }
  }

  _addHandlers() {
    this._elements.dropdown.addEventListener('focus', this._showOptionList);
    this._elements.dropdown.addEventListener('mousedown', this._showOptionList);
    this._elements.dropdown.addEventListener('blur', this._onBlur);
    this._elements.dropdown.addEventListener('keydown', this._onKeyDown);
    this._elements.dropdownInput.addEventListener('focus', this._showOptionList);
    this._elements.dropdownInput.addEventListener('blur', this._onBlur);
    if (this.config) {
      this._elements.dropdownInput.addEventListener('keyup', this._onInputKeyPress);
    }
    this._elements.dropdownArrow.addEventListener('mousedown', this._onArrowClick);
  }

  _setActive = (e) => {
    const el = e.currentTarget;
    el.classList.add(this._classes.listItemActive);
    this._activeOption = el.getAttribute('data-id');
  };

  _removeActive = () => {
    const activeIndex = this._filteredResult.findIndex(id => id === this._activeOption);
    if (activeIndex >= 0) this._getOptionElementById(this._activeOption).classList.remove(this._classes.listItemActive);
    this._activeOption = null;
  };

  _getOptionElementById = (id) => {
    return [].find.call(this._elements.dropdownList.querySelectorAll(`.${this._classes.listItem}`), (el) => {
      return el.getAttribute('data-id') === id
    })
  };

  _updateActiveOption = (keyCode) => {
    // update current active option after keyboard arrows press
    let nextActiveIndex = null;
    const list = Array.from(this._elements.dropdownList.querySelectorAll(`.${this._classes.listItem}`));
    const activeIndex = list.findIndex(item => item.getAttribute('data-id') === this._activeOption);
    if (activeIndex < 0) {
      nextActiveIndex = 0;
    } else if (keyCode === 38) {
      nextActiveIndex = activeIndex <= 0 ? list.length - 1 : activeIndex - 1;
    } else if (keyCode === 40) {
      nextActiveIndex = activeIndex >= list.length - 1 ? 0 : activeIndex + 1;
    }

    if (nextActiveIndex >= 0 && list[nextActiveIndex]) {
      list[nextActiveIndex].classList.add(this._classes.listItemActive);
      this._activeOption = list[nextActiveIndex].getAttribute('data-id');
    } else {
      this._activeOption = null;
    }
    if (activeIndex >= 0 && list[activeIndex]) list[activeIndex].classList.remove(this._classes.listItemActive);

    if (this._activeOption) this.scrollIfNeeded();
  };

  scrollIfNeeded = () => {
    // check that active option is visible now, and scroll to it if that`s wrong
    const dropdownNode = this._elements.dropdownList;
    if (!dropdownNode) return;
    const focusedItemNode = this._getOptionElementById(this._activeOption);
    const scrollTop = dropdownNode.scrollTop;
    const scrollBottom = scrollTop + dropdownNode.offsetHeight;
    const optionTop = focusedItemNode.offsetTop;
    const optionBottom = optionTop + focusedItemNode.offsetHeight;
    if (scrollTop > optionTop) {
      dropdownNode.scrollTop = focusedItemNode.offsetTop;
    } else if(scrollBottom < optionBottom) {
      dropdownNode.scrollTop = optionBottom - dropdownNode.offsetHeight
    }
  };

  _onKeyDown = ({ keyCode }) => {
    if (!this._isOpenList() && keyCode !== 27) {
      // show list option if we have focus on dropdown, but list is hidden (after selecting option)
      this._showOptionList();
    }

    if (this._isOpenList() && keyCode === 27) {
      // close on ESC
      this._closeList();
    } else if (keyCode === 38 || keyCode === 40) {
      // set focus to dropdown container on arrow up/down keys
      this._elements.dropdown.focus();
      this._updateActiveOption(keyCode);
    } else if (keyCode === 13) {
      this._onEnter();
    } else if (
      (keyCode === 8) ||
      (keyCode >= 48 && keyCode <= 90) ||
      (keyCode >= 186 && keyCode <= 222) ||
      (keyCode >= 96 && keyCode <= 105)
    ) {
      // set focus to input if user start typing
      this._elements.dropdownInput.focus();
    }
  };

  _onEnter = () => {
    this._selectItem(this._activeOption);
  };

  _onSelect = (e) => {
    const el = e.currentTarget;
    const id = el.getAttribute('data-id');
    this._selectItem(id);
  };

  _selectItem = (id) => {
    if (id) {
      if (!this.config.multiSelect) {
        this._selected = {};
      }
      this._selected[id] = true;
      this._addSelectedElement(this._indexedOptions.byId[id]);
      const activeEl = this._getOptionElementById(this._activeOption);
      if (activeEl) activeEl.classList.remove(this._classes.listItemActive);
      this._activeOption = null;
      this._initFilterResults();
      if (!this.config.multiSelect) {
        this._closeList();
      }
    }
  };

  _addSelectedElement(item) {
    if (!this.config.multiSelect) {
      // clear selected options if it`s not multi
      this._elements.dropdownSelectedAvatars.innerHTML = '';
      this._elements.dropdownSelected.innerHTML = '';
    }
    if (!this.config.noAvatar) {
      this._elements.dropdownSelectedAvatars.appendChild(this._createSelectedAvatarItem(item));
    }
    this._elements.dropdownSelected.appendChild(this._createSelectedTabItem(item, this.config.multiSelect));
  }

  _removeUnselectedElement(id) {
    const tabToRemove = this._elements.dropdownSelected.querySelector('[data-id="' + id + '"]');
    this._elements.dropdownSelected.removeChild(tabToRemove);
    if (!this.config.noAvatar) {
      const avatarToRemove = this._elements.dropdownSelectedAvatars.querySelector('[data-id="' + id + '"]');
      this._elements.dropdownSelectedAvatars.removeChild(avatarToRemove);
    }
  }

  _createSelectedAvatarItem(item) {
    const image = document.createElement('img');
    image.classList.add(this._classes.dropdownSelectedAvatar);
    image.setAttribute('src', item.img);
    image.setAttribute('data-id', item.id);
    return image;
  }

  _createSelectedTabItem(item, isMulti) {
    const tab = document.createElement('div');
    const close = document.createElement('div');

    tab.classList.add(isMulti ? this._classes.dropdownSelectedItem : this._classes.dropdownSelectedSingle);
    close.classList.add(this._classes.dropdownSelectedClose);
    close.setAttribute('data-id', item.id);
    close.addEventListener('mousedown', this._onDeselect);
    tab.setAttribute('data-id', item.id);
    tab.innerText = item.name;
    tab.appendChild(close);
    return tab;
  }

  _onDeselect = (e) => {
    const el = e.currentTarget;
    const currentId = el.getAttribute('data-id');
    if (currentId) {
      delete this._selected[currentId];
      this._initFilterResults();
      this._removeUnselectedElement(currentId);
    }
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  _isOpenList() {
    return this._elements.dropdownList.classList.contains(this._classes.listOpen);
  }

  _hideList() {
    this._elements.dropdownList.classList.remove(this._classes.listOpen);
    this._elements.dropdown.classList.remove(this._classes.dropdownOpen);
  }

  _showList() {
    this._elements.dropdownList.classList.add(this._classes.listOpen);
    this._elements.dropdown.classList.add(this._classes.dropdownOpen);
  }

  _showOptionList = () => {
    clearTimeout(this._closeTimeout);
    if (!this._isOpenList()) {
      this._initFilterResults();
      this._showList();
    }
  };

  _onBlur = () => {
    // close after timeout, timeout will be removed if next focused element will be in dropdown
    this._closeTimeout = setTimeout(() => this._closeList(), 0);
  };

  _closeList = () => {
    clearTimeout(this._closeTimeout);
    this._currentValue = '';
    this._elements.dropdownInput.value = '';
    this._hideList();
  };

  _onInputKeyPress = (e) => {
    if (e.target.value === this._currentValue) return false;
    this._currentValue = e.target.value;
    this._initFilterResults();
  };

  _onArrowClick = (e) => {
    if (!this._isOpenList()) {
      this._elements.dropdownInput.focus();
    } else {
      this._elements.dropdown.focus();
      this._closeList();
    }
    // preventing focus event after arrow click and make focus manually for change event order
    e.stopPropagation();
    e.preventDefault();
  };

  _initFilterResults() {
    const filterResults = this._filterResults(this._currentValue, this._indexedOptions);
    if (!isEqual(filterResults, this._filteredResult)) {
      this._filteredResult = filterResults;
      this._renderListItems();
    }
  }

  _mixServerResults(items) {
    let filterResults = [ ...this._filteredResult ];
    items.forEach(item => {
      if (!this._indexedOptions.byId[item.id]) {
        // if option is new, we updating indexedOptions
        this._indexedOptions = indexOptions([item], this.config.indexWordLength, this._indexedOptions);
      }
      if (!filterResults.find(id => id === item.id)) {
        // if option is not shown, add it to show list
        filterResults.push(item.id);
      }
    });
    filterResults = removeSelected(filterResults, this._selected);
    if (!isEqual(filterResults, this._filteredResult)) {
      // update if option list changed after response
      this._filteredResult = filterResults;
      this._renderListItems();
    }
  }

  _getDataFromServer(value) {
    clearTimeout(this._ajaxTimeout);
    // timeout 500 for waiting next typed word
    if (value) {
      this._ajaxTimeout = setTimeout(() => {
        ajax({
          url: this.config.apiUrl,
          params: { value },
          contentType: 'json'
        })
          .then((items) => {
            if (this._currentValue === value) {
              this._mixServerResults(items);
            }
          })
          .catch()
      }, 500);
    }
  }

  _filterResults(value, items) {
    value = value.trim();
    if (this.config.withApi) {
      this._getDataFromServer(value);
    }
    let filtered = filter(value, items, this.config.indexWordLength);
    if (this.config.multiSelect) {
      filtered = removeSelected(filtered, this._selected);
    }
    return filtered;
  }
}
