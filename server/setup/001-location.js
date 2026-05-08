import {_val, _db} from "@netuno/server-types"

// Insert Country Data
_db.insertIfNotExists(
    "country",
    _val.map()
        .set("uid", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
        .set("name", "Brasil")
        .set("code", "BR")
)

_db.insertIfNotExists(
    "country",
    _val.map()
        .set("uid", "d3bd73c4-faeb-4cde-b73b-d9602a75cdda")
        .set("name", "Portugal")
        .set("code", "PT")
)

// Insert State Data
_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "9f1e2d3c-4b5a-6789-abcd-0f1e2d3c4b5a")
        .set("name", "Rio Grande do Norte")
        .set("code", "RN")
        .set("country_id", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "ec752771-3c16-4887-a496-076b3e82745e")
        .set("name", "São Paulo")
        .set("code", "SP")
        .set("country_id", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "b3c80fe8-a27b-48b8-ab79-74e3a5d12158")
        .set("name", "Rio de Janeiro")
        .set("code", "RJ")
        .set("country_id", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "a1f2b3c4-d5e6-4789-abcd-0a1b2c3d4e6f")
        .set("name", "Minas Gerais")
        .set("code", "MG")
        .set("country_id", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "b2c3d4e5-f6a7-4890-bcde-1b2c3d4e5f7a")
        .set("name", "Bahia")
        .set("code", "BA")
        .set("country_id", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "c3d4e5f6-a7b8-4901-cdef-2c3d4e5f6a8b")
        .set("name", "Paraná")
        .set("code", "PR")
        .set("country_id", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "d4e5f6a7-b8c9-5012-def0-3d4e5f6a7b9c")
        .set("name", "Rio Grande do Sul")
        .set("code", "RS")
        .set("country_id", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "e5f6a7b8-c9d0-6123-ef01-4e5f6a7b8c0d")
        .set("name", "Pernambuco")
        .set("code", "PE")
        .set("country_id", "3b2bf9ed-610e-45d8-94ae-aefd34279453")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "a9b8c7d6-e5f4-4123-9876-0a1b2c3d4e5f")
        .set("name", "Lisboa")
        .set("code", "LS")
        .set("country_id", "d3bd73c4-faeb-4cde-b73b-d9602a75cdda")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "b1c2d3e4-f5a6-4234-8765-1b2c3d4e5f6a")
        .set("name", "Porto")
        .set("code", "PO")
        .set("country_id", "d3bd73c4-faeb-4cde-b73b-d9602a75cdda")
)

_db.insertIfNotExists(
    "state",
    _val.map()
        .set("uid", "c2d3e4f5-a6b7-4345-7654-2c3d4e5f6a7b")
        .set("name", "Faro")
        .set("code", "FA")
        .set("country_id", "d3bd73c4-faeb-4cde-b73b-d9602a75cdda")
)

// Insert City Data

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f")
        .set("name", "Natal")
        .set("state_id", "9f1e2d3c-4b5a-6789-abcd-0f1e2d3c4b5a")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "2692c307-b5ed-4913-99f7-e2ad20d00131")
        .set("name", "São Paulo")
        .set("state_id", "ec752771-3c16-4887-a496-076b3e82745e")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "562a9f12-5a90-4c67-94cb-6459df7e3434")
        .set("name", "São Gonçalo")
        .set("state_id", "b3c80fe8-a27b-48b8-ab79-74e3a5d12158")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "f6a7b8c9-d0e1-4321-abcd-5f6a7b8c9d0e")
        .set("name", "Belo Horizonte")
        .set("state_id", "a1f2b3c4-d5e6-4789-abcd-0a1b2c3d4e6f")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "0a1b2c3d-4e5f-6789-abcd-6a7b8c9d0e1f")
        .set("name", "Uberlândia")
        .set("state_id", "a1f2b3c4-d5e6-4789-abcd-0a1b2c3d4e6f")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "1b2c3d4e-5f6a-7890-bcde-7b8c9d0e1f2a")
        .set("name", "Salvador")
        .set("state_id", "b2c3d4e5-f6a7-4890-bcde-1b2c3d4e5f7a")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "2c3d4e5f-6a7b-8901-cdef-8c9d0e1f2a3b")
        .set("name", "Feira de Santana")
        .set("state_id", "b2c3d4e5-f6a7-4890-bcde-1b2c3d4e5f7a")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "3d4e5f6a-7b8c-9012-def0-9d0e1f2a3b4c")
        .set("name", "Curitiba")
        .set("state_id", "c3d4e5f6-a7b8-4901-cdef-2c3d4e5f6a8b")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "4e5f6a7b-8c9d-0123-ef01-0e1f2a3b4c5d")
        .set("name", "Maringá")
        .set("state_id", "c3d4e5f6-a7b8-4901-cdef-2c3d4e5f6a8b")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "5f6a7b8c-9d0e-1234-f012-1f2a3b4c5d6e")
        .set("name", "Porto Alegre")
        .set("state_id", "d4e5f6a7-b8c9-5012-def0-3d4e5f6a7b9c")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "6a7b8c9d-0e1f-2345-0123-2a3b4c5d6e7f")
        .set("name", "Caxias do Sul")
        .set("state_id", "d4e5f6a7-b8c9-5012-def0-3d4e5f6a7b9c")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "7b8c9d0e-1f2a-3456-1234-3b4c5d6e7f8a")
        .set("name", "Recife")
        .set("state_id", "e5f6a7b8-c9d0-6123-ef01-4e5f6a7b8c0d")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "8c9d0e1f-2a3b-4567-2345-4c5d6e7f8a9b")
        .set("name", "Olinda")
        .set("state_id", "e5f6a7b8-c9d0-6123-ef01-4e5f6a7b8c0d")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "d3e4f5a6-b7c8-4567-6543-3d4e5f6a7b8c")
        .set("name", "Lisbon")
        .set("state_id", "a9b8c7d6-e5f4-4123-9876-0a1b2c3d4e5f")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "e4f5a6b7-c8d9-4678-5432-4e5f6a7b8c9d")
        .set("name", "Sintra")
        .set("state_id", "a9b8c7d6-e5f4-4123-9876-0a1b2c3d4e5f")
)

// Cities for Porto
_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "f5a6b7c8-d9e0-4789-4321-5f6a7b8c9d0e")
        .set("name", "Porto")
        .set("state_id", "b1c2d3e4-f5a6-4234-8765-1b2c3d4e5f6a")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "06b7c8d9-e0f1-4890-3210-6a7b8c9d0e1f")
        .set("name", "Vila Nova de Gaia")
        .set("state_id", "b1c2d3e4-f5a6-4234-8765-1b2c3d4e5f6a")
)

// Cities for Faro
_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "17c8d9e0-f1a2-4901-210f-7b8c9d0e1f2a")
        .set("name", "Faro")
        .set("state_id", "c2d3e4f5-a6b7-4345-7654-2c3d4e5f6a7b")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("uid", "28d9e0f1-a2b3-4a12-10f0-8c9d0e1f2a3b")
        .set("name", "Loulé")
        .set("state_id", "c2d3e4f5-a6b7-4345-7654-2c3d4e5f6a7b")
)
