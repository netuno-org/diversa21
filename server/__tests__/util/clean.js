const cleanObject = (obj, keys) => {
  const copy = { ...obj };
  keys.forEach(key => delete copy[key]);
  return copy;
};

export default cleanObject;
