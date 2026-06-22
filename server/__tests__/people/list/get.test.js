import request from "supertest";

import toBePeople from '../../custom/people.js';
import login from '../../util/login.js';
import { NETUNO_URL } from '../../config.js';

expect.extend({ toBePeople });

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
  expect(response.body.data.pagination.pageSize).toBe(10);
  expect(typeof response.body.data.pagination.totalCount).toBe("number");
  expect(response.body.data.pagination.totalCount).toBe(14);
  expect(response.body.data).toHaveProperty("items");
  expect(response.body.data.items[0]).toBePeople();

  // this test will work if the list of users has 10 users per page
  const sortedUsers = ["Alice", "Ben", "Bob", "Charlie", "Elijah", "Gestor", "Isabela", "Jack", "Lucas", "Noah"];
  expect(response.body.data.items.map(e => e.name)).not.toEqual(sortedUsers);
});
