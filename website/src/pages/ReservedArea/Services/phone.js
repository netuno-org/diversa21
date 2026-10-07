const MAX_VISIBLE_LENGTH = 20;
const MAX_DIGITS = 15;

const SEPARATORS = new Set([" ", "(", ")", "-"]);

export function sanitizePhoneInput(value) {
  if (value == null) {
    return "";
  }

  let visible = "";
  let digits = 0;

  for (const char of String(value)) {
    if (visible.length >= MAX_VISIBLE_LENGTH) {
      break;
    }

    if (char >= "0" && char <= "9") {
      if (digits >= MAX_DIGITS) {
        continue;
      }
      visible += char;
      digits += 1;
      continue;
    }

    if (char === "+" && visible.length === 0) {
      visible += char;
      continue;
    }

    if (SEPARATORS.has(char)) {
      visible += char;
    }
  }

  return visible;
}

export function normalizePhone(value) {
  return sanitizePhoneInput(value).replace(/[ ()-]/g, "");
}
