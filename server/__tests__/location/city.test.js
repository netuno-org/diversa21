import request from "supertest";

import login from '../util/login.js';
import config from "../config.js";

let testCountryUid;
let testStateUid;
let createdCityUid;

beforeEach(async () => {
  const accessToken = await login.asSuperAdmin();

  const uniqueSuffix = Date.now();

  await request(config.NETUNO_URL)
    .post("/location/country")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ name: `CityTestCountry-${uniqueSuffix}`, code: `C${uniqueSuffix}`.slice(0, 3) })
    .expect(200);

  const countryListResponse = await request(config.NETUNO_URL)
    .get("/location/country")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  testCountryUid = countryListResponse.body.data.find(c => c.name === `CityTestCountry-${uniqueSuffix}`).uid;

  await request(config.NETUNO_URL)
    .post("/location/state")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ name: `CityTestState-${uniqueSuffix}`, code: `S${uniqueSuffix}`.slice(0, 3), countryUid: testCountryUid })
    .expect(200);

  const stateListResponse = await request(config.NETUNO_URL)
    .get("/location/state")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  testStateUid = stateListResponse.body.data.find(s => s.name === `CityTestState-${uniqueSuffix}`).uid;
});

afterEach(async () => {
  const accessToken = await login.asSuperAdmin();

  if (createdCityUid) {
    await request(config.NETUNO_URL)
      .delete(`/location/city?uid=${createdCityUid}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json");
    createdCityUid = undefined;
  }

  if (testStateUid) {
    await request(config.NETUNO_URL)
      .delete(`/location/state?uid=${testStateUid}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json");
    testStateUid = undefined;
  }

  if (testCountryUid) {
    await request(config.NETUNO_URL)
      .delete(`/location/country?uid=${testCountryUid}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json");
    testCountryUid = undefined;
  }
});

describe("POST /location/city", () => {
  test("create a new city", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Testcity", stateUid: testStateUid })
      .expect(200);

    expect(response.body.result).toBe(true);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const created = listResponse.body.data.find(c => c.name === "Testcity");
    expect(created).toBeDefined();
    expect(created.stateUid).toBe(testStateUid);
    createdCityUid = created.uid;
  });

  test("create a city with non-existent state returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Ghostcity", stateUid: "7c076702-0f99-44b9-b4f5-7b6d4810b7d8" })
      .expect(404);

    expect(response.body.error).toBe("state-not-found");
  });

  test("create a city with duplicate name in same state returns 409", async () => {
    const accessToken = await login.asSuperAdmin();

    const firstResponse = await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Duplicatecity", stateUid: testStateUid })
      .expect(200);

    expect(firstResponse.body.result).toBe(true);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    createdCityUid = listResponse.body.data.find(c => c.name === "Duplicatecity").uid;

    const response = await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Duplicatecity", stateUid: testStateUid })
      .expect(409);

    expect(response.body.error).toBe("city-already-exists");
  });

  test("create a city without permission returns 403", async () => {
    const accessToken = await login.asTest();

    await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Noaccesscity", stateUid: testStateUid })
      .expect(403);
  });
});

describe("GET /location/city", () => {
  test("get all cities", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.result).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe("GET /location/city/search", () => {
  test("search a city by name", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Searchablecity", stateUid: testStateUid })
      .expect(200);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    createdCityUid = listResponse.body.data.find(c => c.name === "Searchablecity").uid;

    const response = await request(config.NETUNO_URL)
      .get("/location/city/search?name=Searchablecity")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.result).toBe(true);
    const found = response.body.data.find(c => c.uid === createdCityUid);
    expect(found).toBeDefined();
  });
});

describe("PUT /location/city", () => {
  test("update an existing city", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Updatecity", stateUid: testStateUid })
      .expect(200);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    createdCityUid = listResponse.body.data.find(c => c.name === "Updatecity").uid;

    const response = await request(config.NETUNO_URL)
      .put("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: createdCityUid, name: "Updatedcity", stateUid: testStateUid })
      .expect(200);

    expect(response.body.result).toBe(true);

    const updatedListResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const updated = updatedListResponse.body.data.find(c => c.uid === createdCityUid);
    expect(updated.name).toBe("Updatedcity");
  });

  test("update a city with non-existent uid returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .put("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: "7c076702-0f99-44b9-b4f5-7b6d4810b7d8", name: "Ghostcity", stateUid: testStateUid })
      .expect(404);

    expect(response.body.error).toBe("city-not-found");
  });

  test("update a city with non-existent state returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Movecity", stateUid: testStateUid })
      .expect(200);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    createdCityUid = listResponse.body.data.find(c => c.name === "Movecity").uid;

    const response = await request(config.NETUNO_URL)
      .put("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: createdCityUid, name: "Movecity", stateUid: "7c076702-0f99-44b9-b4f5-7b6d4810b7d8" })
      .expect(404);

    expect(response.body.error).toBe("state-not-found");
  });
});

describe("DELETE /location/city", () => {
  test("delete an existing city", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Deletecity", stateUid: testStateUid })
      .expect(200);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const uidToDelete = listResponse.body.data.find(c => c.name === "Deletecity").uid;

    const response = await request(config.NETUNO_URL)
      .delete(`/location/city?uid=${uidToDelete}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .expect(200);

    expect(response.body.result).toBe(true);

    const finalListResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const stillExists = finalListResponse.body.data.find(c => c.uid === uidToDelete);
    expect(stillExists).toBeUndefined();
  });

  test("delete a city with non-existent uid returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .delete("/location/city?uid=7c076702-0f99-44b9-b4f5-7b6d4810b7d8")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .expect(404);

    expect(response.body.error).toBe("city-not-found");
  });
});
