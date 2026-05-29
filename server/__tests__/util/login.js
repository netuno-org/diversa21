import request from "supertest";

const NETUNO_URL = "http://localhost:9000/services";

const loginAs = async (name) => {
  const loginResponse = await request(NETUNO_URL)
    .put("/_auth")
    .set("Content-Type", "application/json")
    .set("Accept", "*/*")
    .send({
      username: name,
      password: "12345678",
      jwt: true
    })

  return loginResponse.body.access_token;
}

export default {
  asTest: () => loginAs("test"),
  asSuperAdmin: () => loginAs("super"),
}
