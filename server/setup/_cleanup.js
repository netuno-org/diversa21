function dropColumnIfExists(table, column) {
  if (_db.checkExists().column(table, column)) {
      _db.column().drop(table, column);
  }
}

dropColumnIfExists("people", "banner")
dropColumnIfExists("institution", "banner")
dropColumnIfExists("institution", "logo")
dropColumnIfExists("notification", "people_id")
