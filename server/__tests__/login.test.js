import request from "supertest";
import config from "./config.js"

test("login with user Test", async () => {
  const response = await request(config.NETUNO_URL)
    .put("/_auth")
    .set("Content-Type", "application/json")
    .set("Accept", "*/*")
    .send({
      username: "test",
      password: "12345678",
      jwt: true
    })
    .expect("Content-Type", "application/json")
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("access_token");
});

test("login with a user that doesn't exist", async () => {
  const response = await request(config.NETUNO_URL)
    .put("/_auth")
    .set("Content-Type", "application/json")
    .set("Accept", "*/*")
    .send({
      username: "notexist",
      password: "12345678",
      jwt: true
    })
    .expect("Content-Type", "application/json")
    .expect(403);

  expect(response.body.result).toBe(false);
  expect(response.body).not.toHaveProperty("access_token");
});
