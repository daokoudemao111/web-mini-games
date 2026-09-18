CREATE TABLE IF NOT EXISTS drawing_boards (
 turn_key TEXT PRIMARY KEY,
 room_code TEXT NOT NULL,
 state TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS drawing_boards_room ON drawing_boards(room_code);
CREATE TRIGGER IF NOT EXISTS drawing_cleanup_delete AFTER DELETE ON rooms BEGIN DELETE FROM drawing_boards WHERE room_code=OLD.code; END;
CREATE TRIGGER IF NOT EXISTS drawing_cleanup_reset AFTER UPDATE OF state ON rooms WHEN json_extract(NEW.state,'$.match') IS NULL BEGIN DELETE FROM drawing_boards WHERE room_code=NEW.code; END;
