import { MEMBER, MANAGEMENT, REVIEW, SUPER_ADMIN } from "#core/lib/groups.js";

const locationTypes = ["city", "state", "country"];

const toBePeople = (received) => {
  let pass = true;
  let message = "";

  for (const property of ["name", "username", "description", "uid", "email", "birthDate"]) {
    const isPropertyString = (typeof received[property] === "string");
    if (!isPropertyString) {
      message += `${property} should be of type string, got ${typeof received[property]}\n`;
    }
    pass &&= isPropertyString;
  }

  for (const property of ["active", "avatar"]) {
    const isPropertyBoolean = (typeof received[property] === "boolean");
    if (!isPropertyBoolean) {
      message += `${property} should be of type boolean, got ${typeof received[property]}\n`;
    }
    pass &&= isPropertyBoolean;
  }

  for (const locationType of locationTypes) {
    const isNameString = (typeof received[locationType].name === "string");
    const isUidString = (typeof received[locationType].uid === "string");
    if (!isUidString) {
      message += `${locationType}.uid should be of type string, got ${typeof received[locationType].uid}\n`;
    }
    if (!isNameString) {
      message += `${locationType}.name should be of type string, got ${typeof received[locationType].name}\n`;
    }
    pass &&= isNameString && isUidString;
  }

  for (const property of ["name", "code"]) {
    const isPropertyString = (typeof received.group[property] === "string");
    if (!isPropertyString) {
      message += `group.${property} should be of type string, got ${typeof received.group[property]}\n`;
    }
    pass &&= isPropertyString;
  }

  const isGroupCodeCorrect = [MEMBER, MANAGEMENT, REVIEW, SUPER_ADMIN].includes(received.group.code);
  if (!isGroupCodeCorrect) {
    message += `group.code should be member, management, review or super-admin, got ${received.group.code}\n`;
  }
  pass &&= isGroupCodeCorrect;

  return {
    pass,
    message
  };
}

export default toBePeople;
