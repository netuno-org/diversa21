import request from "supertest";

import login from '../util/login.js';
import { NETUNO_URL } from '../config.js';

let newPostUid;

beforeEach(async () => {
  const accessToken = await login.asSuperAdmin();

  const createPostRequest = await request(NETUNO_URL)
    .post("/post")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ content: "new post" })
    .expect(200);

  newPostUid = createPostRequest.body.uid;
});

afterEach(async () => {
  const accessToken = await login.asSuperAdmin();

  await request(NETUNO_URL)
    .delete(`/post?uid=${newPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
});

test("delete post without loging in", async () => {
  const uid = "b3499f27-44b8-4169-92ea-d0a8b6c12148";
  await request(NETUNO_URL)
    .delete(`/post?uid=${uid}`)
    .expect(401);
});

test("delete post", async () => {
  const accessToken = await login.asSuperAdmin();

  const createCommentRequest = await request(NETUNO_URL)
    .post(`/post?parent=${newPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ content: "new post" })
    .expect(200);

  const newCommentUid = createCommentRequest.body.uid;

  const newLikeRequest = await request(NETUNO_URL)
    .post(`/post/like?uid=${newPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .send({ content: "new post" })
    .expect(200);
  
  await request(NETUNO_URL)
    .delete(`/post?uid=${newPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(200);

  await request(NETUNO_URL)
    .get(`/post/list?parent=${newPostUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);

  // test if the comment on the deleted post was also deleted
  await request(NETUNO_URL)
    .get(`/post/list?parent=${newCommentUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);
});

it("shouldn't delete post without passing an UID parameter", async () => {
  const accessToken = await login.asSuperAdmin();

  await request(NETUNO_URL)
    .delete("/post")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(400);
});

it("shouldn't delete post with an empty UID", async () => {
  const accessToken = await login.asSuperAdmin();

  await request(NETUNO_URL)
    .delete("/post?uid=")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(400);
});

it("shouldn't delete post with a UID in the wrong format", async () => {
  const accessToken = await login.asSuperAdmin();

  await request(NETUNO_URL)
    .delete("/post?uid=1")
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(400);
});

it("shouldn't delete a post with an UID that's not on the database", async () => {
  const accessToken = await login.asSuperAdmin();
  const fakeUid = "132f1697-fffd-4d6c-a265-a66298a63ce0";

  await request(NETUNO_URL)
    .delete(`/post?uid=${fakeUid}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .set("Accept", "*/*")
    .set("Content-Type", "application/json")
    .expect(404);
});
