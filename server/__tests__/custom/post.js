const toBePost = (received) => {
  let pass = true;
  let message = "";

  for (const property of ["content", "moment", "uid"]) {
    const isPropertyString = (typeof received[property] === "string");
    if (!isPropertyString) {
      message += `${property} should be of type string, got ${typeof received[property]}\n`;
    }
    pass &&= isPropertyString;
  }

  for (const property of ["liked"]) {
    const isPropertyBoolean = (typeof received[property] === "boolean");
    if (!isPropertyBoolean) {
      message += `${property} should be of type boolean, got ${typeof received[property]}\n`;
    }
    pass &&= isPropertyBoolean;
  }

  for (const property of ["comments", "likes"]) {
    const isPropertyNumber = (typeof received[property] === "number");
    if (!isPropertyNumber) {
      message += `${property} should be of type number, got ${typeof received[property]}\n`;
    }
    pass &&= isPropertyNumber;
  }

  const isAvatarBoolean = (typeof received.people.avatar === "boolean");
  if (!isAvatarBoolean) {
    message += `people.avatar should be of type boolean, got ${typeof received.people.avatar}\n`;
  }
  pass &&= isAvatarBoolean;

  for (const property of ["name", "user", "uid"]) {
    const isPropertyString = (typeof received.people[property] === "string");
    if (!isPropertyString) {
      message += `people.${property} should be of type string, got ${typeof received.people[property]}\n`;
    }
    pass &&= isPropertyString;
  }

  return {
    pass,
    message
  };
}

export default toBePost;
