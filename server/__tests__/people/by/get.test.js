import request from "supertest";

import toBePeople from '../../custom/people.js';
import login from '../../util/login.js';
import { userUid } from '../../util/uids.js';
import config from "../../config.js";

expect.extend({ toBePeople });

test("get by username", async () => {
  const accessToken = await login.asTest();

  const response = await request(config.NETUNO_URL)
    .get("/people/by?username=alice1")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  const user = response.body.data;
  expect(user).toBePeople();
  expect(user.uid).toBe(userUid.alice);
});

test("get by username not found", async () => {
  const accessToken = await login.asTest();

  const response = await request(config.NETUNO_URL)
    .get("/people/by?username=notexist")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);

  expect(response.body.error).toBe("user-not-found");
});

test("get by, missing username parameter", async () => {
  const accessToken = await login.asTest();

  await request(config.NETUNO_URL)
    .get("/people/by")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});
