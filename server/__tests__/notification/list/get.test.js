import request from "supertest";

import { userUid } from '../../util/uids.js';
import { username } from '../../util/usernames.js';
import login from '../../util/login.js';
import config from "../../config.js";

beforeEach(async () => {
  const accessToken = await login.asTest(); 

  await request(config.NETUNO_URL)
    .post(`/friend?uid=${userUid.ben}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);
});

afterEach(async () => {
  const accessToken = await login.asTest();

  await request(config.NETUNO_URL)
    .delete(`/friend?uid=${userUid.ben}`)
    .set("Authorization", `Bearer ${accessToken}`)
});

test("get notifications without loging in", async () => {
  await request(config.NETUNO_URL)
    .get("/notification/list")
    .expect(401);
});

test("users should be able to get notifications when someone asked to be a friend", async () => {
  const accessToken = await login.asBen();

  const response = await request(config.NETUNO_URL)
    .get("/notification/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pagination.pageSize).toBe(5);
  expect(response.body.data.pagination.totalCount).toBe(1);
  expect(response.body.data).toHaveProperty("items");

  const notification = response.body.data.items[0];
  expect(notification.originator.username).toBe("test");
  expect(notification.title).toBe("@test");
  expect(notification.content).toBe("Quer ser seu amigo.");
  expect(notification.type).toBe("friend-request");
  expect(notification.read_at).toBe("");
  expect(notification).toHaveProperty("sent_at");
});

test("notifications of friendship request should be deleted after the request is canceled", async () => {
  let accessToken = await login.asTest(); 

  await request(config.NETUNO_URL)
    .delete(`/friend?uid=${userUid.ben}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  accessToken = await login.asBen();

  const response = await request(config.NETUNO_URL)
    .get("/notification/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pagination.pageSize).toBe(5);
  expect(response.body.data.pagination.totalCount).toBe(0);
  expect(response.body.data).toHaveProperty("items");

  expect(response.body.data.items).toStrictEqual([]);
});

test("notifications of friendship request should be deleted after the request is rejected", async () => {
  const accessToken = await login.asBen();

  await request(config.NETUNO_URL)
    .delete(`/friend?uid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  const response = await request(config.NETUNO_URL)
    .get("/notification/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pagination.pageSize).toBe(5);
  expect(response.body.data.pagination.totalCount).toBe(0);
  expect(response.body.data).toHaveProperty("items");

  expect(response.body.data.items).toStrictEqual([]);
});

test("users should be able to get notifications when someone accepted their friend request", async () => {
  let accessToken = await login.asBen();

  await request(config.NETUNO_URL)
    .put(`/friend?uid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  accessToken = await login.asTest(); 

  const response = await request(config.NETUNO_URL)
    .get("/notification/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pagination.pageSize).toBe(5);
  expect(response.body.data.pagination.totalCount).toBe(1);
  expect(response.body.data).toHaveProperty("items");

  const notification = response.body.data.items[0];
  expect(notification.originator.username).toBe(username.ben);
  expect(notification.title).toBe("@" + username.ben);
  expect(notification.content).toBe("Aceitou seu pedido de amizade.");
  expect(notification.type).toBe("friend-request-accepted");
  expect(notification.read_at).toBe("");
  expect(notification).toHaveProperty("sent_at");
});

test("notifications of friendship request accepted should be deleted after the friendship is removed", async () => {
  let accessToken = await login.asBen();

  await request(config.NETUNO_URL)
    .put(`/friend?uid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  await request(config.NETUNO_URL)
    .delete(`/friend?uid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  accessToken = await login.asTest(); 

  const response = await request(config.NETUNO_URL)
    .get("/notification/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pagination.pageSize).toBe(5);
  expect(response.body.data.pagination.totalCount).toBe(0);
  expect(response.body.data).toHaveProperty("items");

  expect(response.body.data.items).toStrictEqual([]);
});
