import request from "supertest";

import { MEMBER } from "#core/lib/groups.js";
import login from '../util/login.js';
import { userUid, cityUid, institutionUid } from '../util/uids.js';
import cleanObject from '../util/clean.js';
import config from "../config.js";

test("super admin should be able to modify a user", async () => {
  const accessToken = await login.asSuperAdmin();

  const oldDataResponse = await request(config.NETUNO_URL)
    .get(`/people?uid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  const KEYS_TO_REMOVE = ["avatar", "coverImage", "active", "city", "state", "country", "institution", "group"];

  const oldData = cleanObject(oldDataResponse.body.data, KEYS_TO_REMOVE);
  oldData.city = oldDataResponse.body.data.city.uid;
  oldData.institution = oldDataResponse.body.data.institution.uid;
  oldData.group = oldDataResponse.body.data.group.code;
  oldData.active = oldDataResponse.body.data.active;

  const newData = {
    name: "Test Modified",
    username: "testmodified",
    description: "Olá, eu fui modificado!",
    email: "testmodified@membro.com",
    birthDate: "1990-06-15",
    city: cityUid.saoPaulo,
    institution: institutionUid.clinicaSaoRafael,
    group: MEMBER,
    active: true,
  };

  await request(config.NETUNO_URL)
    .put(`/people?uid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send(newData)
    .expect(200);

  const newDataResponse = await request(config.NETUNO_URL)
    .get(`/people?uid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(newDataResponse.body.data.name).toBe(newData.name);
  expect(newDataResponse.body.data.username).toBe(newData.username);
  expect(newDataResponse.body.data.email).toBe(newData.email);
  expect(newDataResponse.body.data.city.uid).toBe(newData.city);
  expect(newDataResponse.body.data.institution.uid).toBe(newData.institution);

  // restore old data
  await request(config.NETUNO_URL)
    .put(`/people?uid=${userUid.test}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send(oldData)
    .expect(200);
});

test("shouldn't be able to modify a user without logging in", async () => {
  await request(config.NETUNO_URL)
    .put(`/people?uid=${userUid.test}`)
    .set("Content-Type", "application/json")
    .send({ 
      name: "Hacker",
      username: "hacker_man",
      email: "hacker@teste.com",
      birthDate: "1990-01-01",
      city: "00000000-0000-0000-0000-000000000001",
      institution: "00000000-0000-0000-0000-000000000002"
    })
    .expect(401);
});

test("shouldn't be able to modify a user that doesn't exist", async () => {
  const accessToken = await login.asSuperAdmin();

  await request(config.NETUNO_URL)
    .put(`/people?uid=${userUid.notExist}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({
      name: "Ghost",
      username: "ghost",
      email: "ghost@membro.com",
      birthDate: "1990-01-01",
      city: cityUid.saoPaulo,
      institution: institutionUid.clinicaSaoRafael,
      group: MEMBER,
      active: true,
    })
    .expect(404);
});

test("member shouldn't be able to modify another user", async () => {
  const accessToken = await login.asTest();

  await request(config.NETUNO_URL)
    .put(`/people?uid=${userUid.super}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({
      name: "Hacked",
      username: "hacked",
      email: "hacked@membro.com",
      birthDate: "1990-01-01",
      city: cityUid.saoPaulo,
      institution: institutionUid.clinicaSaoRafael,
      group: MEMBER,
      active: true,
    })
    .expect(403);
});