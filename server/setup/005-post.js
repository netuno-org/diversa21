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
  },
  {
    uid: "f44e649a-987f-4c2c-9a83-d3ac370f82de",
    people_id: "e7ab1ade-d464-4602-bd61-f0f7eb7c880e", // Superadmin
    parent_id: 0,
    content: "Manutenção do sistema agendada para 20 de maio, 02:00–04:00 UTC. Alguns serviços (envio de arquivos, notificações) podem ficar intermitentes.",
    comments: 1,
    likes: 3 // Gestor, Revisor, Test
  },
  {
    uid: "86635804-1264-4e58-a72a-94d12a75b158",
    people_id: "f0c206fc-923d-40b6-8b2b-6570f698d855", // Test
    parent_id: "f44e649a-987f-4c2c-9a83-d3ac370f82de",
    content: "21 de maio*",
    comments: 0,
    likes: 1 // Superadmin
  }
];

const likes = [
  { post_id: "b3499f27-44b8-4169-92ea-d0a8b6c12148", people_id: "2a86a611-2ab1-472d-a7fe-c41c4aeef36b" }, // Post - Ben, Liked - Alice
  { post_id: "b3499f27-44b8-4169-92ea-d0a8b6c12148", people_id: "b271af58-2fad-473f-b706-a87bbb60b634" }, // Post - Ben, Liked - Noah 
  { post_id: "ab6dd7ae-9721-40ff-8dd1-0d89add93f8d", people_id: "b271af58-2fad-473f-b706-a87bbb60b634" }, // Post - Alice, Liked - Noah
  { post_id: "06fa908f-9fd8-441d-8a08-dd0278be2974", people_id: "29bd1755-a1f6-4d64-adf0-2039f306091b" }, // Post - Noah, Liked - Elijah
  { post_id: "f44e649a-987f-4c2c-9a83-d3ac370f82de", people_id: "6f909f82-f51c-489b-933d-876846b0a7c4" }, // Post - Superadmin, Liked - Gestor,
  { post_id: "f44e649a-987f-4c2c-9a83-d3ac370f82de", people_id: "25312758-5689-4362-a7b5-d877eb94644a" }, // Post - Superadmin, Liked - Revisor
  { post_id: "f44e649a-987f-4c2c-9a83-d3ac370f82de", people_id: "f0c206fc-923d-40b6-8b2b-6570f698d855" }, // Post - Superadmin, Liked - Test 
  { post_id: "86635804-1264-4e58-a72a-94d12a75b158", people_id: "e7ab1ade-d464-4602-bd61-f0f7eb7c880e" }, // Post - Test, Liked - Superadmin
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
