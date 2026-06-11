import request from "supertest";

import toBePost from '../../custom/post.js';
import login from '../../util/login.js';
import { userUid } from '../../util/uids.js'
import { NETUNO_URL } from '../../config.js';

expect.extend({ toBePost });

test("list activities without loging in", async () => {
  await request(NETUNO_URL)
    .get(`/activity/list?peopleUid=${userUid.test}`)
    .expect(401);
});

test("list activities without passing the user UID", async () => {
  const accessToken = await login.asTest(); 

  await request(NETUNO_URL)
    .get("/activity/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});

test("list activities of the user Alice", async () => {
  const accessToken = await login.asTest(); 

  const response = await request(NETUNO_URL)
    .get(`/activity/list?peopleUid=${userUid.alice}`)
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

test("list activities of the user Super", async () => {
  const accessToken = await login.asSuperAdmin(); 

  const response = await request(NETUNO_URL)
    .get(`/activity/list?peopleUid=${userUid.super}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pageSize).toBe(10);
  expect(typeof response.body.data.totalCount).toBe("number");
  expect(response.body.data.totalCount).toBe(1);
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.items[0]).toBePost();
  expect(response.body.data.items[0].content).toBe("Manutenção do sistema agendada para 20 de maio, 02:00–04:00 UTC. Alguns serviços (envio de arquivos, notificações) podem ficar intermitentes.");
});

test("list activities with pagination", async () => {
  const accessToken = await login.asSuperAdmin(); 

  const response = await request(NETUNO_URL)
    .get(`/activity/list?peopleUid=${userUid.super}&page=2`)
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

test("pagination must be a non-negative integer", async () => {
  const accessToken = await login.asSuperAdmin(); 

  await request(NETUNO_URL)
    .get(`/activity/list?peopleUid=${userUid.super}&page=-1`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);

  await request(NETUNO_URL)
    .get(`/activity/list?peopleUid=${userUid.super}&page=a1`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);

  await request(NETUNO_URL)
    .get(`/activity/list?peopleUid=${userUid.super}&page=1a`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);

  await request(NETUNO_URL)
    .get(`/activity/list?peopleUid=${userUid.super}&page=a`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});
