import {_log, _val, _db, _user, _group } from "@netuno/server-types";

// Example names
const people = [
  {
    uid: "f0c206fc-923d-40b6-8b2b-6570f698d855",
    name: "Test",
    username: "test",
    email: "test@membro.com",
    birthDate: "2000-01-01",
    institution: "fbe8724d-1184-49f6-a700-c06ce3f8a338",
    city: "2692c307-b5ed-4913-99f7-e2ad20d00131"
  },
  {
    uid: "2a86a611-2ab1-472d-a7fe-c41c4aeef36b",
    name: "Alice",
    username: "alice1",
    email: "alice1@membro.com",
    birthDate: "2000-01-01",
    institution: "cd7446a2-4052-4400-be66-656a6e458d4c",
    city: "562a9f12-5a90-4c67-94cb-6459df7e3434"

  },
  {
    uid: "0abd451a-b951-4c95-adc9-96332ad6c772",
    name: "Bob",
    username: "bob2",
    email: "bob2@membro.com",
    birthDate: "2000-01-01",
    institution: "8661840b-73d4-415c-bf87-984f1b4a6c42",
    city: "f6a7b8c9-d0e1-4321-abcd-5f6a7b8c9d0e"

  },
  {
    uid: "36c8b6a8-eeb7-4477-ade8-f6a8dbceba41",
    name: "Charlie",
    username: "charlie3",
    email: "charlie3@membro.com",
    birthDate: "2000-01-01",
    institution: "6cfbd98f-8412-4241-87d5-49e2728ed130",
    city: "0a1b2c3d-4e5f-6789-abcd-6a7b8c9d0e1f"

  },
  {
    uid: "b271af58-2fad-473f-b706-a87bbb60b634",
    name: "Noah",
    username: "noah4",
    email: "noah4@membro.com",
    birthDate: "2000-01-01",
    institution: "fbe8724d-1184-49f6-a700-c06ce3f8a338",
    city: "1b2c3d4e-5f6a-7890-bcde-7b8c9d0e1f2a"

  },
  {
    uid: "b1e812a2-9898-4fd3-930f-14f6315c65d5",
    name: "Oliver",
    username: "oliver5",
    email: "oliver5@membro.com",
    birthDate: "2000-01-01",
    institution: "cd7446a2-4052-4400-be66-656a6e458d4c",
    city: "2c3d4e5f-6a7b-8901-cdef-8c9d0e1f2a3b"

  },
  {
    uid: "29bd1755-a1f6-4d64-adf0-2039f306091b",
    name: "Elijah",
    username: "elijah6",
    email: "elijah6@membro.com",
    birthDate: "2000-01-01",
    institution: "8661840b-73d4-415c-bf87-984f1b4a6c42",
    city: "3d4e5f6a-7b8c-9012-def0-9d0e1f2a3b4c"

  },
  {
    uid: "7205c3b9-9660-46fa-bd07-2ec922ebcfd2",
    name: "Isabela",
    username: "isabela7",
    email: "isabela7@membro.com",
    birthDate: "2000-01-01",
    institution: "6cfbd98f-8412-4241-87d5-49e2728ed130",
    city: "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f"

  },
  {
    uid: "c1ef85bb-d427-4d05-a899-f092be7d05f4",
    name: "Lucas",
    username: "lucas8",
    email: "lucas8@membro.com",
    birthDate: "2000-01-01",
    institution: "fbe8724d-1184-49f6-a700-c06ce3f8a338",
    city: "4e5f6a7b-8c9d-0123-ef01-0e1f2a3b4c5d"

  },
  {
    uid: "c61caa3f-98bc-4e7d-8098-d64a1562bd03",
    name: "Jack",
    username: "jack9",
    email: "jack9@membro.com",
    birthDate: "2000-01-01",
    institution: "cd7446a2-4052-4400-be66-656a6e458d4c",
    city: "5f6a7b8c-9d0e-1234-f012-1f2a3b4c5d6e"

  },
  {
    uid: "ceb1b82e-21ee-44cc-828e-fe1ea7ffb06d",
    name: "Ben",
    username: "ben10",
    email: "ben10@membro.com",
    birthDate: "2000-01-01",
    institution: "8661840b-73d4-415c-bf87-984f1b4a6c42",
    city: "d3e4f5a6-b7c8-4567-6543-3d4e5f6a7b8c"

  }
];

const dbNetunoGroup = _group.firstByCode("member");

people.forEach((person, index) => {

  let user_id = null;

  try {
    //Insert User data to users
    const userData = _val.map()
      .set("name", person.name)
      .set("user", person.username)
      .set("pass", "12345678")
      .set("mail", person.email)
      .set("active", true)
      .set("group_id", dbNetunoGroup.getInt("id"));

    user_id = _user.create(userData);

    if (user_id) {
      _db.insertIfNotExists(
        "people",
        _val.map()
        .set("uid", person.uid)
        .set("name", person.name)
        .set("people_user_id", user_id)
        .set("email", person.email)
        .set("birth_date", person.birthDate)
        .set("institution_id", person.institution)
        .set("city_id", person.city)
      );
    }
  } catch (e) {
    _log.warn("error: user not created", e);
    if (user_id) {
      try { _user.remove(user_id); } catch (err) {}
    }
  }
});
