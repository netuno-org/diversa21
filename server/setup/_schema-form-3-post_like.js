/**
  *
  *  CODE GENERATED AUTOMATICALLY
  *
  *  THIS FILE SHOULD NOT BE EDITED BY HAND
  *
  */

_form.createIfNotExists(
	_val.init()
	.set("big", false)
	.set("control_active", true)
	.set("control_group", false)
	.set("control_user", false)
	.set("description", "")
	.set("displayname", "Like")
	.set("export_id", false)
	.set("export_json", true)
	.set("export_lastchange", false)
	.set("export_uid", true)
	.set("export_xls", true)
	.set("export_xml", true)
	.set("firebase", "")
	.set("name", "post_like")
	.set("parent_uid", "488ccf7d-dcb2-46b3-aa8d-c6c17e685555")
	.set("reorder", 0)
	.set("report", false)
	.set("show_id", true)
	.set("uid", "52d73587-b046-4c56-8d64-7350f0540a7d")
)
_form.createComponentIfNotExists(
	"52d73587-b046-4c56-8d64-7350f0540a7d",
	_val.init()
	.set("colspan", 0)
	.set("description", "")
	.set("displayname", "Momento")
	.set("firebase", "")
	.set("group_id", 0)
	.set("height", 0)
	.set("max", 0)
	.set("min", 0)
	.set("name", "moment")
	.set("notnull", true)
	.set("primarykey", false)
	.set("properties", "{\"DEFAULT_CURRENT\":{\"default\":\"false\",\"type\":\"BOOLEAN\",\"value\":\"false\"}}")
	.set("rowspan", 0)
	.set("tdheight", 0)
	.set("tdwidth", 0)
	.set("type", "datetime")
	.set("uid", "32521dbe-4c9c-4a24-9ff0-ef3924715d57")
	.set("user_id", 0)
	.set("whenedit", true)
	.set("whenexport", true)
	.set("whenfilter", true)
	.set("whennew", true)
	.set("whenresult", true)
	.set("whenview", true)
	.set("width", 0)
	.set("x", 1)
	.set("y", 3)
)
_form.createComponentIfNotExists(
	"52d73587-b046-4c56-8d64-7350f0540a7d",
	_val.init()
	.set("colspan", 0)
	.set("description", "")
	.set("displayname", "Pessoa")
	.set("firebase", "")
	.set("group_id", 0)
	.set("height", 0)
	.set("max", 0)
	.set("min", 0)
	.set("name", "people_id")
	.set("notnull", true)
	.set("primarykey", false)
	.set("properties", "{\"MAX_COLUMN_LENGTH\":{\"default\":\"0\",\"type\":\"INTEGER\",\"value\":\"0\"},\"COLUMN_SEPARATOR\":{\"default\":\" - \",\"type\":\"LINK_SEPARATOR\",\"value\":\" - \"},\"LINK\":{\"default\":\"\",\"type\":\"LINK\",\"value\":\"people:name,email\"},\"SERVICE\":{\"default\":\"com/Select.netuno\",\"type\":\"STRING\",\"value\":\"com/Select.netuno\"},\"ONLY_ACTIVES\":{\"default\":\"false\",\"type\":\"BOOLEAN\",\"value\":\"false\"}}")
	.set("rowspan", 0)
	.set("tdheight", 0)
	.set("tdwidth", 0)
	.set("type", "select")
	.set("uid", "a8cee647-e4a0-4373-ab99-313ecd9b4ac5")
	.set("user_id", 0)
	.set("whenedit", true)
	.set("whenexport", true)
	.set("whenfilter", true)
	.set("whennew", true)
	.set("whenresult", true)
	.set("whenview", true)
	.set("width", 0)
	.set("x", 1)
	.set("y", 2)
)
_form.createComponentIfNotExists(
	"52d73587-b046-4c56-8d64-7350f0540a7d",
	_val.init()
	.set("colspan", 0)
	.set("description", "")
	.set("displayname", "Publica\u00E7\u00E3o")
	.set("firebase", "")
	.set("group_id", 0)
	.set("height", 0)
	.set("max", 0)
	.set("min", 0)
	.set("name", "post_id")
	.set("notnull", true)
	.set("primarykey", false)
	.set("properties", "{\"MAX_COLUMN_LENGTH\":{\"default\":\"0\",\"type\":\"INTEGER\",\"value\":\"0\"},\"COLUMN_SEPARATOR\":{\"default\":\" - \",\"type\":\"LINK_SEPARATOR\",\"value\":\" - \"},\"LINK\":{\"default\":\"\",\"type\":\"LINK\",\"value\":\"post:people_id,moment\"},\"SERVICE\":{\"default\":\"com/Select.netuno\",\"type\":\"STRING\",\"value\":\"com/Select.netuno\"},\"ONLY_ACTIVES\":{\"default\":\"false\",\"type\":\"BOOLEAN\",\"value\":\"false\"}}")
	.set("rowspan", 0)
	.set("tdheight", 0)
	.set("tdwidth", 0)
	.set("type", "select")
	.set("uid", "dcd9def1-d815-4b6f-ad2a-05fd3b54a8fc")
	.set("user_id", 0)
	.set("whenedit", true)
	.set("whenexport", true)
	.set("whenfilter", true)
	.set("whennew", true)
	.set("whenresult", true)
	.set("whenview", true)
	.set("width", 0)
	.set("x", 1)
	.set("y", 1)
)