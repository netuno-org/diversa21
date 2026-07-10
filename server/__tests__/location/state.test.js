import request from "supertest";
import login from '../util/login.js';
import config from "../config.js";

let testCountryUid;
let createdStateUid;

beforeEach(async () => {
  const accessToken = await login.asSuperAdmin();

  await request(config.NETUNO_URL)
    .post("/location/country")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ name: `StateTestCountry-${Date.now()}`, code: `S${Date.now()}`.slice(0, 3) })
    .expect(200);

  const listResponse = await request(config.NETUNO_URL)
    .get("/location/country")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  const sorted = listResponse.body.data.sort((a, b) => (a.uid < b.uid ? 1 : -1));
  testCountryUid = sorted.find(c => c.name.startsWith("StateTestCountry")).uid;
});

afterEach(async () => {
  const accessToken = await login.asSuperAdmin();

  if (createdStateUid) {
    await request(config.NETUNO_URL)
      .delete(`/location/state?uid=${createdStateUid}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json");
    createdStateUid = undefined;
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

describe("POST /location/state", () => {
  test("create a new state", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Teststate", code: "TS", countryUid: testCountryUid })
      .expect(200);

    expect(response.body.result).toBe(true);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const created = listResponse.body.data.find(s => s.name === "Teststate");
    expect(created).toBeDefined();
    expect(created.countryUid).toBe(testCountryUid);
    createdStateUid = created.uid;
  });

  test("create a state with non-existent country returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Ghoststate", code: "GS", countryUid: "7c076702-0f99-44b9-b4f5-7b6d4810b7d8" })
      .expect(404);

    expect(response.body.error).toBe("country-not-found");
  });

  test("create a state with duplicate name in same country returns 409", async () => {
    const accessToken = await login.asSuperAdmin();

    const firstResponse = await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Duplicatestate", code: "DS", countryUid: testCountryUid })
      .expect(200);

    expect(firstResponse.body.result).toBe(true);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    createdStateUid = listResponse.body.data.find(s => s.name === "Duplicatestate").uid;

    const response = await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Duplicatestate", code: "DX", countryUid: testCountryUid })
      .expect(409);

    expect(response.body.error).toBe("state-already-exists");
  });

  test("create a state without permission returns 403", async () => {
    const accessToken = await login.asTest();

    await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Noaccessstate", code: "NA", countryUid: testCountryUid })
      .expect(403);
  });
});

describe("GET /location/state", () => {
  test("get all states", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.result).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe("PUT /location/state", () => {
  test("update an existing state", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Updatestate", code: "US", countryUid: testCountryUid })
      .expect(200);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    createdStateUid = listResponse.body.data.find(s => s.name === "Updatestate").uid;

    const response = await request(config.NETUNO_URL)
      .put("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: createdStateUid, name: "Updatedstate", code: "UD", countryUid: testCountryUid })
      .expect(200);

    expect(response.body.result).toBe(true);

    const updatedListResponse = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const updated = updatedListResponse.body.data.find(s => s.uid === createdStateUid);
    expect(updated.name).toBe("Updatedstate");
    expect(updated.code).toBe("UD");
  });

  test("update a state with non-existent uid returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .put("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: "7c076702-0f99-44b9-b4f5-7b6d4810b7d8", name: "Ghoststate", code: "GS", countryUid: testCountryUid })
      .expect(404);

    expect(response.body.error).toBe("state-not-found");
  });

  test("update a state with non-existent country returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Movestate", code: "MV", countryUid: testCountryUid })
      .expect(200);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    createdStateUid = listResponse.body.data.find(s => s.name === "Movestate").uid;

    const response = await request(config.NETUNO_URL)
      .put("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: createdStateUid, name: "Movestate", code: "MV", countryUid: "7c076702-0f99-44b9-b4f5-7b6d4810b7d8" })
      .expect(404);

    expect(response.body.error).toBe("country-not-found");
  });
});

describe("DELETE /location/state", () => {
  test("delete an existing state", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Deletestate", code: "DL", countryUid: testCountryUid })
      .expect(200);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const uidToDelete = listResponse.body.data.find(s => s.name === "Deletestate").uid;

    const response = await request(config.NETUNO_URL)
      .delete(`/location/state?uid=${uidToDelete}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .expect(200);

    expect(response.body.result).toBe(true);

    const finalListResponse = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const stillExists = finalListResponse.body.data.find(s => s.uid === uidToDelete);
    expect(stillExists).toBeUndefined();
  });

  test("delete a state with non-existent uid returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(config.NETUNO_URL)
      .delete("/location/state?uid=7c076702-0f99-44b9-b4f5-7b6d4810b7d8")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .expect(404);

    expect(response.body.error).toBe("state-not-found");
  });

  test("delete a state that has cities returns 409", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(config.NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Hascitystate", code: "HC", countryUid: testCountryUid })
      .expect(200);

    const listResponse = await request(config.NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    createdStateUid = listResponse.body.data.find(s => s.name === "Hascitystate").uid;

    const cityResponse = await request(config.NETUNO_URL)
      .post("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Hascity", stateUid: createdStateUid })
      .expect(200);

    expect(cityResponse.body.result).toBe(true);

    const response = await request(config.NETUNO_URL)
      .delete(`/location/state?uid=${createdStateUid}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .expect(409);

    expect(response.body.error).toBe("state-has-cities");

    // Cleanup: delete city first, then state in afterEach
    const cityListResponse = await request(config.NETUNO_URL)
      .get("/location/city")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const cityToDelete = cityListResponse.body.data.find(c => c.name === "Hascity");
    await request(config.NETUNO_URL)
      .delete(`/location/city?uid=${cityToDelete.uid}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json");
  });
});
