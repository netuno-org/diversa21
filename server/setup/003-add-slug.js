/**
 * Add slug column to institution table
 */

const tableExists = _db.queryFirst(`
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'institution'
    ) as exists
`);

if (tableExists && tableExists.getBoolean('exists')) {
    const columnExists = _db.queryFirst(`
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'institution' 
            AND column_name = 'slug'
        ) as exists
    `);
    
    if (columnExists && !columnExists.getBoolean('exists')) {
        _db.execute(`ALTER TABLE institution ADD COLUMN slug VARCHAR(500)`);
        _log.info("Added slug column to institution table");
        
        // Generate slugs for existing records
        const institutions = _db.query(`SELECT id, name FROM institution WHERE slug IS NULL OR slug = ''`);
        for (const inst of institutions) {
            const slug = _convert.slug(inst.getString('name'));
            _db.execute(`UPDATE institution SET slug = ? WHERE id = ?`, slug, inst.getInt('id'));
        }
        _log.info("Generated slugs for existing institutions");
    }
}