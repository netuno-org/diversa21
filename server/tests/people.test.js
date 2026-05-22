import request from "supertest";

const NETUNO_URL = "http://localhost:9000/services";

const locationTypes = ["city", "state", "country"];

expect.extend({
  toBePeople(received) {
    let pass = true;
    let message = "";

    for (const property of ["birthDate", "name", "username", "uid", "email"]) {
      const thisPropertyIsString = (typeof received[property] === "string");
      if (!thisPropertyIsString) {
        message += `${property} should be of type string, got ${typeof received[property]}\n`;
      }
      pass &&= thisPropertyIsString;
    }

    for (const property of ["active", "avatar"]) {
      const propertyIsBoolean = (typeof received[property] === "boolean");
      if (!propertyIsBoolean) {
        message += `${property} should be of type boolean, got ${typeof received[property]}\n`;
      }
      pass &&= propertyIsBoolean;
    }

    for (const locationType of locationTypes) {
      const nameIsString = (typeof received[locationType].name === "string");
      const uidIsString = (typeof received[locationType].uid === "string");
      if (!uidIsString) {
        message += `${locationType}.uid should be of type string, got ${typeof received[locationType].uid}\n`;
      }
      if (!nameIsString) {
        message += `${locationType}.name should be of type string, got ${typeof received[locationType].name}\n`;
      } 
      pass &&= nameIsString && uidIsString;
    }

    for (const property of ["name", "code"]) {
      const propertyIsString = (typeof received.group[property] === "string");
      // TODO: testar se group.code e group.name tem um dos 4 valores possíveis
      if (!propertyIsString) {
          message += `group.${property} should be of type string, got ${typeof received.group[property]}\n`;
      }
      pass &&= propertyIsString;
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
