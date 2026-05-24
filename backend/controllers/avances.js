const pool = require('../database/db');

exports.list = async (req, res) => {
  try {
    const { ouvrier_id, mois, annee } = req.query;
    let sql = `SELECT a.*, o.nom as ouvrier_nom
               FROM avances a
               JOIN ouvriers o ON a.ouvrier_id = o.id
               WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (ouvrier_id) { sql += ` AND a.ouvrier_id = $${idx++}`; params.push(ouvrier_id); }
    if (mois && annee) {
      sql += ` AND TO_CHAR(a.date::date, 'MM') = $${idx++} AND TO_CHAR(a.date::date, 'YYYY') = $${idx++}`;
      params.push(mois.padStart(2, '0'), annee);
    }
    sql += ' ORDER BY a.date DESC';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { ouvrier_id, date, montant, note } = req.body;
    if (!ouvrier_id || !date || !montant) {
      return res.status(400).json({ error: 'Champs requis: ouvrier_id, date, montant' });
    }
    if (montant <= 0) {
      return res.status(400).json({ error: 'Le montant doit être supérieur à 0' });
    }
    const ouvrier = (await pool.query('SELECT id FROM ouvriers WHERE id = $1', [ouvrier_id])).rows[0];
    if (!ouvrier) return res.status(400).json({ error: 'Ouvrier introuvable' });

    const result = await pool.query(
      'INSERT INTO avances (ouvrier_id, date, montant, note) VALUES ($1, $2, $3, $4) RETURNING id',
      [ouvrier_id, date, montant, note || null]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const existing = (await pool.query('SELECT * FROM avances WHERE id = $1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Avance introuvable' });
    await pool.query('DELETE FROM avances WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
