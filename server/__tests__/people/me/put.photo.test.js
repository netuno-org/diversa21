import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import login from '../../util/login.js';
import { NETUNO_URL } from '../../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test("should be able to upload an avatar", async () => {
  const accessToken = await login.asTest();

  const beforeResponse = await fetch(`${NETUNO_URL}/people/me`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  }).then(r => r.json());

  const formData = new FormData();
  formData.append("name", beforeResponse.data.name);
  formData.append("username", beforeResponse.data.username);
  formData.append("email", beforeResponse.data.email);
  formData.append("description", beforeResponse.data.description || "Test description");
  formData.append("birthDate", beforeResponse.data.birthDate || "2000-01-01");
  formData.append("city", beforeResponse.data.city.uid);
  formData.append("institution", beforeResponse.data.institution.uid);

  const avatarBuffer = readFileSync(resolve(__dirname, "../../fixtures/avatar.jpg"));
  formData.append("avatar", new Blob([avatarBuffer], { type: "image/jpeg" }), "avatar.jpg");

  const putResponse = await fetch(`${NETUNO_URL}/people/me`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${accessToken}` },
    body: formData
  });

  expect(putResponse.status).toBe(200);

  const afterResponse = await fetch(`${NETUNO_URL}/people/me`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  }).then(r => r.json());

  expect(afterResponse.data.avatar).toBe(true);
});

test("should be able to upload a cover image", async () => {
  const accessToken = await login.asTest();

  const beforeResponse = await fetch(`${NETUNO_URL}/people/me`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  }).then(r => r.json());

  const formData = new FormData();
  formData.append("name", beforeResponse.data.name);
  formData.append("username", beforeResponse.data.username);
  formData.append("email", beforeResponse.data.email);
  formData.append("description", beforeResponse.data.description || "Test description");
  formData.append("birthDate", beforeResponse.data.birthDate || "2000-01-01");
  formData.append("city", beforeResponse.data.city.uid);
  formData.append("institution", beforeResponse.data.institution.uid);

  const coverBuffer = readFileSync(resolve(__dirname, "../../fixtures/cover.jpg"));
  formData.append("cover_image", new Blob([coverBuffer], { type: "image/jpeg" }), "cover.jpg");

  const putResponse = await fetch(`${NETUNO_URL}/people/me`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${accessToken}` },
    body: formData
  });

  expect(putResponse.status).toBe(200);

  const afterResponse = await fetch(`${NETUNO_URL}/people/me`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  }).then(r => r.json());

  expect(afterResponse.data.cover_image).toBe(true);
});