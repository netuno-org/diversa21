import request from "supertest";

import config from "../config.js";
import { username } from './usernames.js';

const loginAs = async (name) => {
  const loginResponse = await request(config.NETUNO_URL)
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
  asReview: () => loginAs("review"),
  asBen: () => loginAs(username.ben),
}
