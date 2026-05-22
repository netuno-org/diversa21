import request from "supertest";

const NETUNO_URL = "http://localhost:9000/services";

const locationTypes = ["city", "state", "country"];

expect.extend({
  toBePeople(received) {
    let pass = true;
    let message = "";

    for (const property of ["birthDate", "name", "username", "uid", "email"]) {
      const isThisPropertyString = (typeof received[property] === "string");
      if (!isThisPropertyString) {
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

    return {
      pass,
      message
    };
  }
});

test("unauthorized list people", async () => {
  const response = await request(NETUNO_URL)
    .get("/people/list")
    .expect(401);
});

test("list people", async () => {
  const loginResponse = await request(NETUNO_URL)
    .put("/_auth")
    .set("Content-Type", "application/json")
    .set("Accept", "*/*")
    .send({
      username: "test",
      password: "12345678",
      jwt: true
    })

  const accessToken = loginResponse.body.access_token;

  const response = await request(NETUNO_URL)
    .get("/people/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pageSize).toBe(10);
  expect(typeof response.body.data.totalCount).toBe("number");
  expect(response.body.data.totalCount).toBeGreaterThanOrEqual(0);
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.items[0]).toBePeople();
});
