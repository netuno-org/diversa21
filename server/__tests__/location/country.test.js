import request from "supertest";

import login from '../util/login.js';
import { NETUNO_URL } from '../config.js';

let createdCountryUid;

afterEach(async () => {
  if (!createdCountryUid) {
    return;
  }
  const accessToken = await login.asSuperAdmin();
  await request(NETUNO_URL)
    .delete(`/location/country?uid=${createdCountryUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json");
  createdCountryUid = undefined;
});

describe("POST /location/country", () => {
  test("create a new country", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Testland", code: "TST" })
      .expect(200);

    expect(response.body.result).toBe(true);

    const listResponse = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const created = listResponse.body.data.find(c => c.name === "Testland");
    expect(created).toBeDefined();
    createdCountryUid = created.uid;
  });

  test("create a country with duplicate name returns 409", async () => {
    const accessToken = await login.asSuperAdmin();

    const firstResponse = await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Duplicateland", code: "DPL" })
      .expect(200);

    expect(firstResponse.body.result).toBe(true);

    const listResponse = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const created = listResponse.body.data.find(c => c.name === "Duplicateland");
    createdCountryUid = created.uid;

    const response = await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Duplicateland", code: "DPX" })
      .expect(409);

    expect(response.body.error).toBe("country-already-exists");
  });

  test("create a country with duplicate code returns 409", async () => {
    const accessToken = await login.asSuperAdmin();

    const firstResponse = await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Codeland", code: "CDX" })
      .expect(200);

    expect(firstResponse.body.result).toBe(true);

    const listResponse = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const created = listResponse.body.data.find(c => c.name === "Codeland");
    createdCountryUid = created.uid;

    const response = await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Another Codeland", code: "CDX" })
      .expect(409);

    expect(response.body.error).toBe("country-already-exists");
  });

  test("create a country without permission returns 403", async () => {
    const accessToken = await login.asTest();

    await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Noaccessland", code: "NAL" })
      .expect(403);
  });

  test("create a country without required fields returns 400", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({})
      .expect(400);
  });
});

describe("GET /location/country", () => {
  test("get all countries", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.result).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe("PUT /location/country", () => {
  test("update an existing country", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Updateland", code: "UPL" })
      .expect(200);

    const listResponse = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const created = listResponse.body.data.find(c => c.name === "Updateland");
    createdCountryUid = created.uid;

    const response = await request(NETUNO_URL)
      .put("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: createdCountryUid, name: "Updatedland", code: "UPD" })
      .expect(200);

    expect(response.body.result).toBe(true);

    const updatedListResponse = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const updated = updatedListResponse.body.data.find(c => c.uid === createdCountryUid);
    expect(updated.name).toBe("Updatedland");
    expect(updated.code).toBe("UPD");
  });

  test("update a country with non-existent uid returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(NETUNO_URL)
      .put("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: "7c076702-0f99-44b9-b4f5-7b6d4810b7d8", name: "Ghostland", code: "GHL" })
      .expect(404);

    expect(response.body.error).toBe("country-not-found");
  });

  test("update a country without permission returns 403", async () => {
    const accessToken = await login.asTest();

    await request(NETUNO_URL)
      .put("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ uid: "7c076702-0f99-44b9-b4f5-7b6d4810b7d8", name: "Noaccessland", code: "NAL" })
      .expect(403);
  });
});

describe("DELETE /location/country", () => {
  test("delete an existing country", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Deleteland", code: "DEL" })
      .expect(200);

    const listResponse = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const created = listResponse.body.data.find(c => c.name === "Deleteland");
    const uidToDelete = created.uid;

    const response = await request(NETUNO_URL)
      .delete(`/location/country?uid=${uidToDelete}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .expect(200);

    expect(response.body.result).toBe(true);

    const finalListResponse = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const stillExists = finalListResponse.body.data.find(c => c.uid === uidToDelete);
    expect(stillExists).toBeUndefined();
  });

  test("delete a country with non-existent uid returns 404", async () => {
    const accessToken = await login.asSuperAdmin();

    const response = await request(NETUNO_URL)
      .delete("/location/country?uid=7c076702-0f99-44b9-b4f5-7b6d4810b7d8")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .expect(404);

    expect(response.body.error).toBe("country-not-found");
  });

  test("delete a country that has states returns 409", async () => {
    const accessToken = await login.asSuperAdmin();

    await request(NETUNO_URL)
      .post("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Hasstateland", code: "HSL" })
      .expect(200);

    const listResponse = await request(NETUNO_URL)
      .get("/location/country")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const createdCountry = listResponse.body.data.find(c => c.name === "Hasstateland");
    createdCountryUid = createdCountry.uid;

    const stateResponse = await request(NETUNO_URL)
      .post("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .send({ name: "Hasstate", code: "HST", countryUid: createdCountryUid })
      .expect(200);

    expect(stateResponse.body.result).toBe(true);

    const response = await request(NETUNO_URL)
      .delete(`/location/country?uid=${createdCountryUid}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json")
      .expect(409);

    expect(response.body.error).toBe("country-has-states");

    // Cleanup: delete state first, then country in afterEach
    const stateListResponse = await request(NETUNO_URL)
      .get("/location/state")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const stateToDelete = stateListResponse.body.data.find(s => s.name === "Hasstate");
    await request(NETUNO_URL)
      .delete(`/location/state?uid=${stateToDelete.uid}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Accept", "*/*")
      .set("Content-Type", "application/json");
  });
});
