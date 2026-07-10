import request from "supertest";

import toBePeople from '../custom/people.js';
import login from '../util/login.js';
import { userUid } from '../util/uids.js'
import config from "../config.js";

expect.extend({ toBePeople });

test("get by uid", async () => {
  const accessToken = await login.asTest();

  const response = await request(config.NETUNO_URL)
    .get(`/people?uid=${userUid.bob}`)
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

  await request(config.NETUNO_URL)
    .get("/people")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});

test("get by non-existent paramenter, missing uid paramenter", async () => {
  const accessToken = await login.asTest();

  await request(config.NETUNO_URL)
    .get("/people?foo=bar")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});

test("get by uid not found", async () => {
  const accessToken = await login.asTest();

  const response = await request(config.NETUNO_URL)
    .get(`/people?uid=${userUid.notExist}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);
  
  expect(response.body.error).toBe("user-not-found");
});
