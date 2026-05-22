import request from "supertest";

import { MEMBER, MANAGEMENT, REVIEW, SUPER_ADMIN } from "#core/lib/groups.js";

const NETUNO_URL = "http://localhost:9000/services";

const locationTypes = ["city", "state", "country"];

expect.extend({
  toBePeople(received) {
    let pass = true;
    let message = "";

    for (const property of ["birthDate", "name", "username", "uid", "email"]) {
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
});

test("unauthorized list people", async () => {
  const response = await request(NETUNO_URL)
    .get("/people/list")
    .expect(401);
});


const login = async () => {
  const loginResponse = await request(NETUNO_URL)
    .put("/_auth")
    .set("Content-Type", "application/json")
    .set("Accept", "*/*")
    .send({
      username: "test",
      password: "12345678",
      jwt: true
    })

  return loginResponse.body.access_token;
}

test("list people", async () => {
  const accessToken = await login(); 

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

test("get me", async () => {
  const accessToken = await login();

  const response = await request(NETUNO_URL)
    .get("/people/me")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  const me = response.body.data;
  expect(me).toBePeople();
  expect(me.name).toBe("Test");
  expect(me.username).toBe("test");
  expect(me.email).toBe("test@membro.com");
});

test("get by uid", async () => {
  const accessToken = await login();

  const response = await request(NETUNO_URL)
    .get("/people?uid=0abd451a-b951-4c95-adc9-96332ad6c772")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  const user = response.body.data;
  expect(user).toBePeople();
  expect(user.name).toBe("Bob");
});

test("get by uid not found", async () => {
  const accessToken = await login();

  const response = await request(NETUNO_URL)
    .get("/people?uid=7c076702-0f99-44b9-b4f5-7b6d4810b7d8")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);
  
  expect(response.body.error).toBe("user-not-found");
});

test("get by username", async () => {
  const accessToken = await login();

  const response = await request(NETUNO_URL)
    .get("/people/by?username=alice1")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  const user = response.body.data;
  expect(user).toBePeople();
  expect(user.uid).toBe("2a86a611-2ab1-472d-a7fe-c41c4aeef36b");
});

test("get by username not found", async () => {
  const accessToken = await login();

  const response = await request(NETUNO_URL)
    .get("/people/by?username=notexist")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);
  
  expect(response.body.error).toBe("user-not-found");
});
