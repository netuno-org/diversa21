import request from "supertest";

import toBePeople from '../../../custom/people.js';
import login from '../../../util/login.js';
import { institutionUid } from '../../../util/uids.js';
import config from "../../../config.js";

expect.extend({ toBePeople });

test("list institution people without logging in", async () => {
  await request(config.NETUNO_URL)
    .get("/institution/people/list")
    .query({ uid: institutionUid.clinicaSaoRafael })
    .expect(401);
});

test("list institution people", async () => {
  const accessToken = await login.asTest();

  const response = await request(config.NETUNO_URL)
    .get("/institution/people/list")
    .query({ uid: institutionUid.clinicaSaoRafael })
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.pagination).toHaveProperty("totalCount");
  expect(response.body.data.pagination).toHaveProperty("pageSize");
  expect(response.body.data.pagination.pageSize).toBe(10);
  expect(typeof response.body.data.pagination.totalCount).toBe("number");

  // Clínica São Rafael has 3 members: Test, Noah, Lucas
  expect(response.body.data.pagination.totalCount).toBe(3);
  expect(response.body.data.items).toHaveLength(3);

  // Each item should be a valid people object
  for (const person of response.body.data.items) {
    expect(person).toBePeople();
  }

  // Verify the correct institution is referenced
  for (const person of response.body.data.items) {
    expect(person.institution.uid).toBe(institutionUid.clinicaSaoRafael);
  }
});

test("list institution people with invalid uid returns 404", async () => {
  const accessToken = await login.asTest();

  const response = await request(config.NETUNO_URL)
    .get("/institution/people/list")
    .query({ uid: "00000000-0000-0000-0000-000000000000" })
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);

  expect(response.body.error).toBe("institution-not-found");
});
