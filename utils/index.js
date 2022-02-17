/**
 * Tells whether an object has anything in it or not
 * @param {Object} obj 
 * @returns boolean
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}