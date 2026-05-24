const pool = require('../database/db');

exports.list = async (req, res) => {
  try {
    const { date, chantier_id, ouvrier_id } = req.query;
    let sql = `SELECT p.*, o.nom as ouvrier_nom, o.prenom as ouvrier_prenom, c.nom as chantier_nom
               FROM pointages p
               JOIN ouvriers o ON p.ouvrier_id = o.id
               JOIN chantiers c ON p.chantier_id = c.id
               WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (date) { sql += ` AND p.date = $${idx++}`; params.push(date); }
    if (chantier_id) { sql += ` AND p.chantier_id = $${idx++}`; params.push(chantier_id); }
    if (ouvrier_id) { sql += ` AND p.ouvrier_id = $${idx++}`; params.push(ouvrier_id); }
    sql += ' ORDER BY p.date DESC, o.nom ASC';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.batchSave = async (req, res) => {
  const { date, chantier_id, pointages } = req.body;
  if (!date || !chantier_id || !pointages || !Array.isArray(pointages)) {
    return res.status(400).json({ error: 'Champs requis: date, chantier_id, pointages (tableau)' });
  }

  const cid = parseInt(chantier_id, 10);
  const client = await pool.connect();
  try {
    const chantier = (await client.query('SELECT id FROM chantiers WHERE id = $1', [cid])).rows[0];
    if (isNaN(cid) || !chantier) {
      client.release();
      return res.status(400).json({ error: 'Chantier invalide ou introuvable' });
    }

    for (const p of pointages) {
      const oid = parseInt(p.ouvrier_id, 10);
      const ouvrier = (await client.query('SELECT id FROM ouvriers WHERE id = $1', [oid])).rows[0];
      if (isNaN(oid) || !ouvrier) {
        client.release();
        return res.status(400).json({ error: 'Ouvrier invalide ou introuvable' });
      }
    }

    await client.query('BEGIN');
    for (const p of pointages) {
      await client.query(
        `INSERT INTO pointages (date, ouvrier_id, chantier_id, present, hs)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT(date, ouvrier_id)
         DO UPDATE SET chantier_id = EXCLUDED.chantier_id, present = EXCLUDED.present, hs = EXCLUDED.hs`,
        [date, parseInt(p.ouvrier_id, 10), cid, p.present ? 1 : 0, p.hs || 0]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Erreur lors de l'enregistrement des pointages: " + (err.message || '') });
  } finally {
    client.release();
  }
};

exports.getByDateAndChantier = async (req, res) => {
  try {
    const { date, chantier_id } = req.query;
    if (!date || !chantier_id) {
      return res.status(400).json({ error: 'Paramètres requis: date, chantier_id' });
    }
    const result = await pool.query(
      `SELECT p.*, o.nom as ouvrier_nom, o.prenom as ouvrier_prenom
       FROM pointages p
       JOIN ouvriers o ON p.ouvrier_id = o.id
       WHERE p.date = $1 AND p.chantier_id = $2
       ORDER BY o.nom ASC`,
      [date, chantier_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const existing = (await pool.query('SELECT * FROM pointages WHERE id = $1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Pointage introuvable' });
    await pool.query('DELETE FROM pointages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
