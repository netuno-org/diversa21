import {_val, _db} from "@netuno/server-types"

const institutions = [
  {
    name: "Clínica São Rafael",
    uid: "fbe8724d-1184-49f6-a700-c06ce3f8a338",
    email: "contato@saorafael.com",
    phone: 23450987345,
    website: "https://saorafael.org",
    address: "Av. das Flores, 123",
    post_code: "SR2001",
    city_id: "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f"
  },
  {
    name: "Centro de Imagem Teste",
    uid: "cd7446a2-4052-4400-be66-656a6e458d4c",
    email: "imaginacao@centroimagem.com",
    phone: 10259434597,
    website: "https://centroimagem.test",
    address: "Rua do Diagnóstico, 45",
    post_code: "CI3002",
    city_id: "2692c307-b5ed-4913-99f7-e2ad20d00131"
  },
  {
    name: "Laboratório Modelo",
    uid: "8661840b-73d4-415c-bf87-984f1b4a6c42",
    email: "lab@modelolabs.com",
    phone: 80357203573,
    website: "https://modelolabs.example",
    address: "Alameda dos Testes, 78",
    post_code: "LM4003",
    city_id: "f5a6b7c8-d9e0-4789-4321-5f6a7b8c9d0e"
  },
  {
    name: "Urgência Central Teste",
    uid: "6cfbd98f-8412-4241-87d5-49e2728ed130",
    email: "emergencia@urgenciacentral.com",
    phone: 12357935748,
    website: "https://urgenciacentral.test",
    address: "Praça da Emergência, s/n",
    post_code: "UC5004",
    city_id: "d3e4f5a6-b7c8-4567-6543-3d4e5f6a7b8c"
  }
];

for (let i = 0; i < institutions.length; i++) {
  const institution = institutions[i];

  _db.insertIfNotExists(
    "institution",
    _val.map()
    .set("uid", institution.uid)
    .set("name", institution.name)
    .set("description", `${institution.name}, manda email aqui: ${institution.email}.`)
    .set("email", institution.email)
    .set("telephone", institution.phone)
    .set("website", institution.website)
    .set("address", institution.address)
    .set("post_code", institution.post_code)
    .set("city_id", institution.city_id)
  );
};
