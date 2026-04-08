import {_val, _group} from "@netuno/server-types"

_group.createIfNotExists(
    _val.map()
        .set("name", "Membro")
        .set("code", "member")
)

_group.createIfNotExists(
    _val.map()
        .set("name", "Revisão")
        .set("code", "review")
)

_group.createIfNotExists(
    _val.map()
        .set("name", "Gestão")
        .set("code", "management")
)

_group.createIfNotExists(
    _val.map()
        .set("name", "Super Administrador")
        .set("code", "super-admin")
)
