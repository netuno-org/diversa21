import { _val, _db } from "@netuno/server-types";

const entityTypes = [
  { code: "post", title: "Publicação" },
  { code: "comment", title: "Comentário" },
  { code: "people", title: "Perfil" },
  { code: "forum_topic", title: "Tópico de Fórum" },
  { code: "forum_reply", title: "Resposta de Fórum" }
];

for (const item of entityTypes) {
  const existing = _db.queryFirst(`
    SELECT id FROM report_entity_type WHERE code = ?
  `, item.code);

  if (!existing) {
    _db.insert(
      "report_entity_type",
      _val.map()
        .set("code", item.code)
        .set("title", item.title)
    );
  }
}

const statuses = [
  { code: "pending", title: "Pendente" },
  { code: "in_review", title: "Em Análise" },
  { code: "resolved", title: "Resolvido" },
  { code: "rejected", title: "Rejeitado" }
];

for (const item of statuses) {
  const existing = _db.queryFirst(`
    SELECT id FROM report_status WHERE code = ?
  `, item.code);

  if (!existing) {
    _db.insert(
      "report_status",
      _val.map()
        .set("code", item.code)
        .set("title", item.title)
    );
  }
}

const reasons = [
  { code: "spam", title: "Spam / Publicidade" },
  { code: "hate_speech", title: "Discurso de Ódio" },
  { code: "harassment", title: "Assédio" },
  { code: "inappropriate", title: "Conteúdo Impróprio" },
  { code: "other", title: "Outro" }
];

for (const item of reasons) {
  const existing = _db.queryFirst(`
    SELECT id FROM report_reason WHERE code = ?
  `, item.code);

  if (!existing) {
    _db.insert(
      "report_reason",
      _val.map()
        .set("code", item.code)
        .set("title", item.title)
    );
  }
}
