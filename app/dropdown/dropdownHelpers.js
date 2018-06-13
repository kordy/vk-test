const hardLatin = ["yo", "zh", "kh", "ts", "ch", "sch", "shch", "sh", "eh", "yu", "ya", "YO", "ZH", "KH", "TS", "CH", "SCH", "SHCH", "SH", "EH", "YU", "YA", "'"];
const hardCyr = ["ё", "ж", "х", "ц", "ч", "щ", "щ", "ш", "э", "ю", "я", "Ё", "Ж", "Х", "Ц", "Ч", "Щ", "Щ", "Ш", "Э", "Ю", "Я", "ь"];
const easyLatin = "abvgdezijklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCYёЁ";
const easyCyr = "абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫеЕ";
const invertLatin = "qwertyuiop[]asdfghjkl;'zxcvbnm,./`";
const invertCyr = "йцукенгшщзхъфывапролджэячсмитьбю.ё";

export const parseLatin = (word) => {
  let invWord = word;
  for (let i = 0; hardLatin.length > i; i++)
    invWord = invWord.split(hardLatin[i]).join(hardCyr[i]);
  for (let i = 0; easyLatin.length > i; i++)
    invWord = invWord.split(easyLatin.charAt(i)).join(easyCyr.charAt(i));
  return invWord === word ? '' : invWord;
};

export const parseCyr = (word) => {
  let invWord = word;
  for (let i = 0; i < hardCyr.length; i++)
    invWord = invWord.split(hardCyr[i]).join(hardLatin[i]);
  for (let i = 0; i < easyCyr.length; i++)
    invWord = invWord.split(easyCyr.charAt(i)).join(easyLatin.charAt(i));
  return invWord === word ? '' : invWord;
};

export const parseInvertLatin = (word) => {
  let invWord = word;
  for (let i = 0; i < invertLatin.length; i++)
    invWord = invWord.split(invertLatin.charAt(i)).join(invertCyr.charAt(i));
  return invWord === word ? '' : invWord;
};

export const parseInvertCyr = (word) => {
  let invWord = word;
  for (let i = 0; i < invertCyr.length; i++)
    invWord = invWord.split(invertCyr.charAt(i)).join(invertLatin.charAt(i));
  return invWord === word ? '' : invWord;
};

const findItem = (str, valueArr) => {
  const parsedStr = (' ' + str + ' ' + parseLatin(str) + ' ' + parseCyr(str)).toLowerCase();
  return !valueArr.some(v => {
    return parsedStr.indexOf(' ' + v.direct) < 0 && parsedStr.indexOf(' ' + v.invert) < 0
  });
};

export const indexOptions = (options, indexWordLength = 2, indexedOptions = { letters: {}, byId: {} }) => {
  const letterPush = (letter, id) => {
    letter = letter.toLowerCase();
    letter = ((parseCyr(letter) || letter).substr(0, indexWordLength) + ' ' + parseInvertCyr(letter)).trim();
    letter.split(' ').forEach(l => {
      if (!indexedOptions.letters[l]) indexedOptions.letters[l] = [];
      if (!indexedOptions.letters[l].find(cId => cId === id)) indexedOptions.letters[l].push(id);
    })
  };

  options.forEach(item => {
    indexedOptions.byId[item.id] = item;
    const parts = item.name.split(' ');
    letterPush('', item.id);
    parts.forEach(part => {
      let startLetters = '';
      for (let i = 0; i < indexWordLength && i < part.length; i++) {
        startLetters += part[i];
        letterPush(startLetters, item.id);
      }
    });
  });
  return indexedOptions;
};

export const filter = (value, items, indexWordLength = 2) => {
  const startLetters = value.substr(0, indexWordLength);
  const parseInvertCyrLetters = parseInvertCyr(startLetters) || startLetters;
  const inpLatin = (parseCyr(parseInvertCyrLetters) || parseInvertCyrLetters).substr(0, indexWordLength);
  const inpCyrillic = (parseCyr(parseInvertLatin(startLetters) || startLetters)).substr(0, indexWordLength);

  if (!items.letters[inpLatin] && !items.letters[inpCyrillic]) return [];

  const arrayPart = items.letters[inpLatin] || items.letters[inpCyrillic];
  if (value.length <= indexWordLength) return arrayPart;
  const valueArr = value.replace(/\s+/g, ' ').split(' ')
    .map(v => ({ direct: (v || '').toLowerCase(), invert: (parseInvertLatin(v) || parseInvertCyr(v)).toLowerCase() }));
  return arrayPart.filter(id => findItem(items.byId[id].name, valueArr));
};

export const removeSelected = (items, selected) => {
  if (!selected) return items;
  return items.filter(id => !selected[id])
};