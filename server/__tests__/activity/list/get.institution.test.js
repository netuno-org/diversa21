import request from "supertest";

import toBePost from '../../custom/post.js';
import login from '../../util/login.js';
import { institutionUid } from '../../util/uids.js'
import { NETUNO_URL } from '../../config.js';

expect.extend({ toBePost });

test("list activities of an institution without logging in", async () => {
  await request(NETUNO_URL)
    .get(`/activity/list?institutionUid=${institutionUid.clinicaSaoRafael}`)
    .expect(401);
});

test("list activities of an institution", async () => {
  const accessToken = await login.asTest();

  const response = await request(NETUNO_URL)
    .get(`/activity/list?institutionUid=${institutionUid.clinicaSaoRafael}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pagination.pageSize).toBe(10);
  expect(typeof response.body.data.pagination.totalCount).toBe("number");
  expect(response.body.data).toHaveProperty("items");
  expect(Array.isArray(response.body.data.items)).toBe(true);

  for (const item of response.body.data.items) {
    expect(item).toBePost();
  }
});

test("list activities of a different institution returns different results", async () => {
  const accessToken = await login.asTest();

  const responseA = await request(NETUNO_URL)
    .get(`/activity/list?institutionUid=${institutionUid.clinicaSaoRafael}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  const responseB = await request(NETUNO_URL)
    .get(`/activity/list?institutionUid=${institutionUid.laboratorioModelo}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(responseA.body.result).toBe(true);
  expect(responseB.body.result).toBe(true);

  // posts returned for one institution should belong only to that institution's
  // people, so the sets of post uids should not be identical unless both are empty
  const uidsA = responseA.body.data.items.map(item => item.uid).sort();
  const uidsB = responseB.body.data.items.map(item => item.uid).sort();

  if (uidsA.length > 0 || uidsB.length > 0) {
    expect(uidsA).not.toStrictEqual(uidsB);
  }
});

test("list activities of a non-existent institution returns empty result", async () => {
  const accessToken = await login.asTest();

  const response = await request(NETUNO_URL)
    .get("/activity/list?institutionUid=7c076702-0f99-44b9-b4f5-7b6d4810b7d8")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body.data.pagination.totalCount).toBe(0);
  expect(response.body.data.items).toStrictEqual([]);
});

test("list activities of an institution with pagination", async () => {
  const accessToken = await login.asTest();

  const response = await request(NETUNO_URL)
    .get(`/activity/list?institutionUid=${institutionUid.clinicaSaoRafael}&page=2`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body.data.pagination.pageSize).toBe(10);
  expect(typeof response.body.data.pagination.totalCount).toBe("number");
  expect(response.body.data).toHaveProperty("items");
  // page 2 should never return more than pageSize items
  expect(response.body.data.items.length).toBeLessThanOrEqual(10);
});

test("pagination for institution activities must be a non-negative integer", async () => {
  const accessToken = await login.asTest();

  await request(NETUNO_URL)
    .get(`/activity/list?institutionUid=${institutionUid.clinicaSaoRafael}&page=-1`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);

  await request(NETUNO_URL)
    .get(`/activity/list?institutionUid=${institutionUid.clinicaSaoRafael}&page=a1`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);

  await request(NETUNO_URL)
    .get(`/activity/list?institutionUid=${institutionUid.clinicaSaoRafael}&page=1a`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});

test("list activities without institutionUid nor peopleUid returns 400", async () => {
  const accessToken = await login.asTest();

  await request(NETUNO_URL)
    .get("/activity/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);
});