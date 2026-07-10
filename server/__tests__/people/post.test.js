import request from "supertest";

import { MEMBER } from "#core/lib/groups.js";
import login from '../util/login.js';
import { cityUid, institutionUid } from '../util/uids.js';
import cleanObject from '../util/clean.js';
import config from "../config.js";

// TODO: testar com grupo inexistente, cidade inexistente, instituicao inexistente
// name, username, birthDate e email invalidos

test("create a new user", async () => {
  const accessToken = await login.asSuperAdmin();

  const newData = {
    name: "New User",
    username: "newuser",
    description: "Olá, meu nome é New User.",
    password: "12345678",
    email: "newuser@gmail.com",
    birthDate: "1970-01-01",
    city: cityUid.portoAlegre,
    institution: institutionUid.laboratorioModelo,
    group: MEMBER
  }

  const postResponse = await request(config.NETUNO_URL)
    .post("/people")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send(newData)
    .expect(200);

  expect(postResponse.body.result).toBe(true);

  // verify if the user was inserted
  const newDataResponse = await request(config.NETUNO_URL)
    .get("/people/by?username=newuser")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  const KEYS_TO_REMOVE = [ "uid", "avatar", "active", "city", "state", "country", "institution", "group" ];

  const fetchedUser = cleanObject(newData, KEYS_TO_REMOVE);

  // TODO: remover description quando GET people/by for atualizado para retornar description
  const cleanedNewUser = cleanObject(newData, [ "password", "description" ]);

  fetchedUser.city = newDataResponse.body.data.city.uid;
  fetchedUser.institution = newDataResponse.body.data.institution.uid;
  fetchedUser.group = newDataResponse.body.data.group.code;

  expect(fetchedUser).toMatchObject(cleanedNewUser);
});

afterEach(async () => {
  const accessToken = await login.asSuperAdmin();

  await request(config.NETUNO_URL)
    .delete("/people?username=newuser")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(200);
});
