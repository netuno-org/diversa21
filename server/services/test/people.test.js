import request from "supertest";

const NETUNO_URL = "http://localhost:9000/services";

const locationTypes = ["city", "state", "country"];

expect.extend({
  toBePeople(received) {
    let pass = true;
    let message = '\n';

    for (const property of ["birthDate", "name", "username", "uid", "email"]) {
      const thisPropertyIsString = (typeof received[property] === "string");
      pass &&= thisPropertyIsString;
      if (!thisPropertyIsString) {
        message += `${property} should be of type string, `;
      }
    }

    for (const property of ["active", "avatar"]) {
      const thisPropertyIsBoolean = (typeof received[property] === "boolean");
      pass &&= thisPropertyIsBoolean;
      if (!thisPropertyIsBoolean) {
        message += `${property} should be of type boolean, got ${typeof received[property]}\n`;
      }
    }

    for (const locationType of locationTypes) {
      const nameIsString = (typeof received[locationType].name === "string");
      const uidIsString = (typeof received[locationType].uid === "string");
      pass &&= nameIsString && uidIsString;
      if (!uidIsString) {
        message += `${locationType}.uid should be of type string, got ${typeof received[locationType].uid}\n`;
      }
      if (!nameIsString) {
        message += `${locationType}.name should be of type string, got ${typeof received[locationType].name}\n`;
      } 
    }


    for (const property of ["name", "code"]) {
      const propertyIsString = (typeof received.group[property] === "string");
      if (!propertyIsString) {
          message += `group.${property} should be of type string, got ${typeof received.group[property]}\n`;
      }
      pass &&= propertyIsString;
    }

    message.replace(/\. $/, "");

    return {
      pass,
      message: `Expected object to have properties: ${message}`
    };
  }
})

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
