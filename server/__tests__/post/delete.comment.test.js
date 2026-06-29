import request from "supertest";

import login from '../util/login.js';
import { NETUNO_URL } from '../config.js';

let parentPostUid;
let commentUid;

beforeEach(async () => {
  const accessToken = await login.asSuperAdmin();

  // Create a parent post
  const createParentRequest = await request(NETUNO_URL)
    .post("/post")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ content: "parent post" })
    .expect(200);

  parentPostUid = createParentRequest.body.uid;

  // Create a comment on the parent post
  const createCommentRequest = await request(NETUNO_URL)
    .post(`/post?parent=${parentPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ content: "comment on parent post" })
    .expect(200);

  commentUid = createCommentRequest.body.uid;
});

afterEach(async () => {
  const accessToken = await login.asSuperAdmin();

  // Cleanup: delete the parent post (cascades to comments)
  await request(NETUNO_URL)
    .delete(`/post?uid=${parentPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json");
});

test("deleting a comment should decrement the parent post comments counter by 1", async () => {
  const accessToken = await login.asSuperAdmin();

  // Check that the parent post has 1 comment before deleting
  const beforeDeleteResponse = await request(NETUNO_URL)
    .get(`/post?uid=${parentPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(beforeDeleteResponse.body.data.comments).toBe(1);

  // Delete the comment
  await request(NETUNO_URL)
    .delete(`/post?uid=${commentUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(200);

  // Check that the parent post now has 0 comments
  const afterDeleteResponse = await request(NETUNO_URL)
    .get(`/post?uid=${parentPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(afterDeleteResponse.body.data.comments).toBe(0);
});

test("deleting a comment should not affect other comments on the same parent post", async () => {
  const accessToken = await login.asSuperAdmin();

  // Create a second comment on the same parent post
  const createSecondCommentRequest = await request(NETUNO_URL)
    .post(`/post?parent=${parentPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ content: "second comment on parent post" })
    .expect(200);

  const secondCommentUid = createSecondCommentRequest.body.uid;

  // Parent should now have 2 comments
  const beforeDeleteResponse = await request(NETUNO_URL)
    .get(`/post?uid=${parentPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(beforeDeleteResponse.body.data.comments).toBe(2);

  // Delete only the first comment
  await request(NETUNO_URL)
    .delete(`/post?uid=${commentUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(200);

  // Parent should now have 1 comment remaining
  const afterDeleteResponse = await request(NETUNO_URL)
    .get(`/post?uid=${parentPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  expect(afterDeleteResponse.body.data.comments).toBe(1);

  // Cleanup second comment
  await request(NETUNO_URL)
    .delete(`/post?uid=${secondCommentUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json");
});

test("deleting a comment should also remove it from the database", async () => {
  const accessToken = await login.asSuperAdmin();

  // Delete the comment
  await request(NETUNO_URL)
    .delete(`/post?uid=${commentUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(200);

  // Trying to list children of the deleted comment should return 404
  await request(NETUNO_URL)
    .get(`/post/list?parent=${commentUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);
});