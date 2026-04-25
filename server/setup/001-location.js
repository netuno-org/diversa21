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

// Insert City Data

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("name", "São Paulo")
        .set("state_id", "ec752771-3c16-4887-a496-076b3e82745e")
)

_db.insertIfNotExists(
    "city",
    _val.map()
        .set("name", "São Gonçalo")
        .set("state_id", "b3c80fe8-a27b-48b8-ab79-74e3a5d12158")
)
