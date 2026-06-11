import request from "supertest";

import toBePost from '../../custom/post.js';
import login from '../../util/login.js';
import { userUid, postUid } from '../../util/uids.js'
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

it("shouldn't return comments if parent is not passed", async () => {
  const accessToken = await login.asTest(); 

  const response = await request(NETUNO_URL)
    .get(`/post/list?peopleUid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pageSize).toBe(10);
  expect(typeof response.body.data.totalCount).toBe("number");
  expect(response.body.data.totalCount).toBe(0);
  expect(response.body.data).toHaveProperty("items");
});

test("list comments on a post", async () => {
  const accessToken = await login.asTest(); 

  const response = await request(NETUNO_URL)
    .get(`/post/list?parent=${postUid.primeiroPost}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pageSize).toBe(10);
  expect(typeof response.body.data.totalCount).toBe("number");
  expect(response.body.data.totalCount).toBe(2);
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.items[0]).toBePost();
  expect(response.body.data.items[0].content).toBe("eesh tarde demais");
  expect(response.body.data.items[1].content).toBe("Primeiro comentário!");
});

test("list posts by a user", async () => {
  const accessToken = await login.asTest(); 

  const response = await request(NETUNO_URL)
    .get(`/post/list?peopleUid=${userUid.ben}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pageSize).toBe(10);
  expect(typeof response.body.data.totalCount).toBe("number");
  expect(response.body.data.totalCount).toBe(1);
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.items[0]).toBePost();
  expect(response.body.data.items[0].content).toBe("Primeiro post!");
});

test("list posts with pagination", async () => {
  const accessToken = await login.asSuperAdmin(); 

  const response = await request(NETUNO_URL)
    .get("/post/list?page=2")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pageSize).toBe(10);
  expect(typeof response.body.data.totalCount).toBe("number");
  expect(response.body.data.totalCount).toBe(0);
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.items).toStrictEqual([]);
});
