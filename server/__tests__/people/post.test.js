import request from "supertest";

import login from '../util/login.js';

const NETUNO_URL = "http://localhost:9000/services";

test("create a new user", async () => {
  const accessToken = await login.asSuperAdmin();

  const newData = {
    name: "New User",
    username: "newuser",
    email: "newuser@gmail.com",
    birthDate: "1970-01-01",
    city: "2692c307-b5ed-4913-99f7-e2ad20d00131",
    institution: "fbe8724d-1184-49f6-a700-c06ce3f8a338"
  }

  await request(NETUNO_URL)
    .put("/people/me")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send(newData)
    .expect(200);

  const newDataResponse = await request(NETUNO_URL)
    .get("/people/me")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  let { newAvatar, newActive, newState, newCountry, newGroup, newCity, newInstitution, ...fetchedUser } = newDataResponse.body.data;
  fetchedUser.city = newDataResponse.body.data.city.uid;
  fetchedUser.institution = newDataResponse.body.data.institution.uid;

  expect(fetchedUser).toMatchObject(newData);

  await request(NETUNO_URL)
    .put("/people/me")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send(oldData)
    .expect(200);
});
