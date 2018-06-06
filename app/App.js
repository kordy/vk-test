import './App.styl';

class Dropdown {
  constructor(element = '#dropdown', userConfig) {
    this._element = document.querySelector(element);
    this._init()
  }

  _init() {
    const inputBlock = `
      <div class="dropdown">
        <input class="dropdown__input" placeholder="Введите имя друга или id"/>
        <div class="dropdown__arrow"></div>
        <div class="dropdown-list">
          <div class="dropdown-list__item">
            <img class="dropdown-list__image" src="https://pp.userapi.com/c834201/v834201260/13d7da/3cuXqcdN2QE.jpg" />
            <div class="dropdown-list__name">Алекс</div>
          </div>
           <div class="dropdown-list__item">
            <img class="dropdown-list__image" src="https://pp.userapi.com/c834201/v834201260/13d7da/3cuXqcdN2QE.jpg" />
            <div class="dropdown-list__name">Алекс</div>
          </div>
           <div class="dropdown-list__item">
            <img class="dropdown-list__image" src="https://pp.userapi.com/c834201/v834201260/13d7da/3cuXqcdN2QE.jpg" />
            <div class="dropdown-list__name">Алекс</div>
          </div>
        <div class="dropdown-list__item">
            <img class="dropdown-list__image" src="https://pp.userapi.com/c834201/v834201260/13d7da/3cuXqcdN2QE.jpg" />
            <div class="dropdown-list__name">Алекс</div>
          </div>
        </div>
      </div>
    `;
    this._element.innerHTML = inputBlock;
    // return list;
  }
}

new Dropdown();