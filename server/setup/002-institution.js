import {_val, _db} from "@netuno/server-types"

// Insert Institution Example Data
_db.insertIfNotExists(
    "institution",
    _val.map()
        .set("name", "Hospital de Testes")
        .set("description", "É um hospital de testes..")
        .set("email", "test@hospital.com")
        .set("telephone", "12334556709")
        .set("website", "https://tests.org")
        .set("address", "Rua de Testes")
        .set("post_code", "HT1009")
        .set("city_id", "2692c307-b5ed-4913-99f7-e2ad20d00131")
)
