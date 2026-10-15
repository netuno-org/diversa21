/*
  * Utilities to build SQL text searches
  */

// Both strings must keep the same length: each character maps to the one in the same position.
const ACCENTED = "ÁÀÂÃÄÅáàâãäåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñÝýÿ";
const UNACCENTED = "AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNnYyy";

export default {
  // Uses translate() instead of the unaccent extension, which requires CREATE EXTENSION privileges.
  // Usage: `${search.unaccent("city.name")} ILIKE ${search.unaccent("?::text")}`
  unaccent: (expression) => `translate(${expression}, '${ACCENTED}', '${UNACCENTED}')`,
}
