import request from "supertest";

import toBePeople from '../../custom/people.js';
import login from '../../util/login.js';

expect.extend({ toBePeople });

const NETUNO_URL = "http://localhost:9000/services";

test("get me", async () => {
  const accessToken = await login.asTest();

  const response = await request(NETUNO_URL)
    .get("/people/me")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  const me = response.body.data;
  expect(me).toBePeople();
  expect(me.name).toBe("Test");
  expect(me.username).toBe("test");
  expect(me.email).toBe("test@membro.com");
});

