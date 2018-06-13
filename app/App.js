import Dropdown from './dropdown/Dropdown.js'
import './App.styl';

let API_URL = '/api.php';
let people = window.PEOPLE;

if (process.env.NODE_ENV === 'development') {
  people = require('./people.json');
  API_URL = 'http://vkdropdown.loc/api.php';
}

new Dropdown('#dropdown_single', people, { multiSelect: false, autocomplete: false, placeholder: 'Выберите из списка..', withApi: false });
new Dropdown('#dropdown_multi', people, { multiSelect: true, autocomplete: false, placeholder: 'Выберите из списка..', withApi: false });
new Dropdown('#dropdown_autocomplete', people, { withApi: false });
new Dropdown('#dropdown_noavatar', people, { withApi: false, noAvatar: true });
new Dropdown('#dropdown_server', people, { withApi: true, apiUrl: API_URL });
