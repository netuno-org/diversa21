import {_log, _val, _db, _user, _group } from "@netuno/server-types";

// Example posts
const posts = [
  {
    uid: "b3499f27-44b8-4169-92ea-d0a8b6c12148",
    people_id: "ceb1b82e-21ee-44cc-828e-fe1ea7ffb06d", // Ben
    parent_id: 0,
    content: "Primeiro post!",
    comments: 2, // Alice & Noah
    likes: 2 // Alice and Noah
  },
  {
    uid: "ab6dd7ae-9721-40ff-8dd1-0d89add93f8d",
    people_id: "2a86a611-2ab1-472d-a7fe-c41c4aeef36b", // Alice
    parent_id: "b3499f27-44b8-4169-92ea-d0a8b6c12148", // Ben - Primeiro Post
    content: "Primeiro comentário!",
    comments: 0,
    likes: 1 // Noah
  },
  {
    uid: "06fa908f-9fd8-441d-8a08-dd0278be2974",
    people_id: "b271af58-2fad-473f-b706-a87bbb60b634", // Noah
    parent_id: "b3499f27-44b8-4169-92ea-d0a8b6c12148", // Ben - Primeiro Post
    content: "eesh tarde demais",
    comments: 1, // Elijah
    likes: 1 // Elijah
  },
  {
    uid: "c41d08d5-45ba-434b-a679-08b79a73b386",
    people_id: "29bd1755-a1f6-4d64-adf0-2039f306091b", // Elijah
    parent_id: "06fa908f-9fd8-441d-8a08-dd0278be2974", // Noah - Tarde Demais
    content: "ia dizer o mesmo haha",
    comments: 0,
    likes: 0
  }
];

const likes = [
  { post_id: "b3499f27-44b8-4169-92ea-d0a8b6c12148", people_id: "2a86a611-2ab1-472d-a7fe-c41c4aeef36b" }, // Post - Ben, Liked - Alice
  { post_id: "b3499f27-44b8-4169-92ea-d0a8b6c12148", people_id: "b271af58-2fad-473f-b706-a87bbb60b634" }, // Post - Ben, Liked - Noah 
  { post_id: "ab6dd7ae-9721-40ff-8dd1-0d89add93f8d", people_id: "b271af58-2fad-473f-b706-a87bbb60b634" }, // Post - Alice, Liked - Noah
  { post_id: "06fa908f-9fd8-441d-8a08-dd0278be2974", people_id: "29bd1755-a1f6-4d64-adf0-2039f306091b" }, // Post - Noah, Liked - Elijah
];

posts.forEach((post) => {
  try {
    _db.insertIfNotExists("post", _val.map()
      .set("uid", post.uid)
      .set("people_id", post.people_id)
      .set("moment", _db.timestamp())
      .set("parent_id", post.parent_id)
      .set("content", post.content)
      .set("comments", post.comments)
      .set("likes", post.likes)
    )
  } catch (e) {
    _log.warn("error: post not created", e);
  }
});

likes.forEach((like) => {
  try {
    _db.insertIfNotExists("post_like", _val.map()
      .set("post_id", like.post_id)
      .set("people_id", like.people_id)
      .set("moment", _db.timestamp())
    );
  } catch (e) {
    _log.warn("error: like not created", e);
  }
});
