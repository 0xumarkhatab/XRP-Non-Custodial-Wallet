export function capitalize(str) {
  let _str = String(str);
  _str = _str.toUpperCase()[0] + _str.slice(1);
  return _str;
}
export function arrayToPrivateKey(array_) {
  return Array.from(array_, (byte) => {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}
