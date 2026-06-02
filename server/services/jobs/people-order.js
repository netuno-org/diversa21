import { _db } from "@netuno/server-types"

_db.execute(`
  UPDATE people
  SET "order" = (
      SELECT string_agg(floor(random() * 10)::text, '')
      FROM generate_series(1, 7)
      WHERE people.id IS NOT NULL -- Forces row-by-row re-evaluation
  );`
);

_log.info("Job de reordenar pessoas")
_out.print("Ok")
