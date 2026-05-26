import request from "supertest";

const NETUNO_URL = "http://localhost:9000/services";

const loginAsTest = async () => {
  const loginResponse = await request(NETUNO_URL)
    .put("/_auth")
    .set("Content-Type", "application/json")
    .set("Accept", "*/*")
    .send({
      username: "test",
      password: "12345678",
      jwt: true
    })

  return loginResponse.body.access_token;
}

export default loginAsTest;
