import request from "supertest";

import toBePost from '../../custom/post.js';
import login from '../../util/login.js';
import { NETUNO_URL } from '../../config.js';

expect.extend({ toBePost });

test("list posts without loging in", async () => {
  await request(NETUNO_URL)
    .get("/post/list")
    .expect(401);
});

test("list posts", async () => {
  const accessToken = await login.asTest(); 

  const response = await request(NETUNO_URL)
    .get("/post/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pageSize).toBe(10);
  expect(typeof response.body.data.totalCount).toBe("number");
  expect(response.body.data.totalCount).toBe(2);
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.items[0]).toBePost();
  expect(response.body.data.items[0].liked).toBe(true);
  expect(response.body.data.items[1].liked).toBe(false);
});
