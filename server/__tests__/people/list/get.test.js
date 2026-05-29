import request from "supertest";

import toBePeople from '../../custom/people.js';
import login from '../../util/login.js';

expect.extend({ toBePeople });

const NETUNO_URL = "http://localhost:9000/services";

test("list people without loging in", async () => {
  await request(NETUNO_URL)
    .get("/people/list")
    .expect(401);
});

test("list people", async () => {
  const accessToken = await login.asTest(); 

  const response = await request(NETUNO_URL)
    .get("/people/list")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(response.body.result).toBe(true);
  expect(response.body).toHaveProperty("data");
  expect(response.body.data.pageSize).toBe(10);
  expect(typeof response.body.data.totalCount).toBe("number");
  expect(response.body.data.totalCount).toBeGreaterThanOrEqual(0);
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.items[0]).toBePeople();
});
