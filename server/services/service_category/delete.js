import { _req, _db, _val, _out, _user } from "@netuno/server-types";

if (_user.id() === 0) {
    _out.json(_val.map().set("result", false).set("error", "Não tens sessão iniciada."));
    _req.stop();
}

const dbUserGroup = _db.queryFirst(`
    SELECT netuno_group.code AS code
    FROM netuno_user
    INNER JOIN netuno_group ON netuno_user.group_id = netuno_group.id
    WHERE netuno_user.id = ?
`, _user.id());

const userGroup = dbUserGroup ? dbUserGroup.getString("code") : "";

if (userGroup !== "super-admin" && userGroup !== "management") {
    _out.json(_val.map().set("result", false).set("error", "Não tens permissões para apagar categorias."));
    _req.stop();
}

const uid = _req.getString("uid");

const dbCategory = _db.queryFirst("SELECT id FROM service_category WHERE uid = ?::uuid", uid);

if (!dbCategory) {
    _out.json(_val.map().set("result", false).set("error", "Categoria não encontrada."));
    _req.stop();
}

const categoryId = dbCategory.getInt("id");

const hasServices = _db.queryFirst("SELECT id FROM service WHERE category_id = ? LIMIT 1", categoryId);

if (hasServices) {
    _out.json(
        _val.map()
            .set("result", false)
            .set("error", "Não é possível apagar: existem serviços associados a esta categoria.")
    );
    _req.stop();
}

_db.execute("DELETE FROM service_category WHERE id = ?", categoryId);

_out.json(_val.map().set("result", true).set("message", "Categoria apagada com sucesso."));