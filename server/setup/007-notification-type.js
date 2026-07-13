import {_val, _db} from "@netuno/server-types"

const types = [
  {
    uid: "3570ecd3-6e86-442c-8f4f-25e8b7d14dc0",
    name: "Pedido de amizade",
    code: "friend-request"
  },
  {
    uid: "61260d08-fd0c-4a9c-8903-b7edc2fd338d",
    name: "Pedido de amizade aceito",
    code: "friend-request-accepted"
  },
  {
    uid: "d2447734-5056-489f-93b4-249f80f2a269",
    name: "Post de amigo",
    code: "friend-post"
  },
  // seu amigo fez uma resposta a um post que não é seu
  {
    uid: "642a6972-8364-4929-bdba-285640c5bd16",
    name: "Comentário de amigo",
    code: "friend-comment"
  },
  // seu amigo deu like em um post qualquer (que não é um post seu)
  {
    uid: "55e630b5-a8d6-4d03-930d-ad958d637c68",
    name: "Like de amigo",
    code: "friend-like"
  },
  // alguém da mesma instituição que você escreveu um post 
  {
    uid: "65d750a8-fb4e-4f24-b061-f16e4023d832",
    name: "Post de alguém da instituição",
    code: "institution-post"
  },
  // alguém da mesma instituição que você deu um like em um post que não é seu
  {
    uid: "b9dbe397-d220-4ff5-9fec-a13842c6c152",
    name: "Like da instituição",
    code: "institution-like"
  },
  // alguém da mesma instituição que você escreveu uma resposta a um post que não é seu
  {
    uid: "a4ce39cb-1e1f-40b6-81d9-4048c3956466",
    name: "Comentário da instituição",
    code: "institution-comment"
  },
  {
    uid: "9153c14a-0fec-4cc5-b005-75f8df3552e2",
    name: "Like em seu post",
    code: "my-post-like"
  },
  {
    uid: "98091421-3845-4a0b-a933-54c1f67d87f5",
    name: "Comentário em seu post",
    code: "my-post-comment"
  },
  {
    uid: "7f3a9c2e-1d4b-4e8a-9f6c-2b5d8e1a4c7f",
    name: "Mensagem",
    code: "message"
  }
];

for (const type of types) {
  _db.insertIfNotExists(
    "notification_type",
    _val.map()
      .set("uid", type.uid)
      .set("name", type.name)
      .set("code", type.code)
  );
};
