import request from "supertest";

import toBePeople from '../custom/people.js';
import login from '../util/login.js';

expect.extend({ toBePeople });

const NETUNO_URL = "http://localhost:9000/services";

test("get by uid", async () => {
  const accessToken = await login.asTest();

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

test("get missing uid paramenter", async () => {
  const accessToken = await login.asTest();

  await request(NETUNO_URL)
    .get("/people")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});

test("get by non-existent paramenter, missing uid paramenter", async () => {
  const accessToken = await login.asTest();

  await request(NETUNO_URL)
    .get("/people?foo=bar")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});

test("get by uid not found", async () => {
  const accessToken = await login.asTest();

  const response = await request(NETUNO_URL)
    .get("/people?uid=7c076702-0f99-44b9-b4f5-7b6d4810b7d8")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);
  
  expect(response.body.error).toBe("user-not-found");
});
