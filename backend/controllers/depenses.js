const pool = require('../database/db');

exports.list = async (req, res) => {
  try {
    const { chantier_id, mois, annee } = req.query;
    let sql = `SELECT d.*, c.nom as chantier_nom
               FROM depenses d
               JOIN chantiers c ON d.chantier_id = c.id
               WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (chantier_id) { sql += ` AND d.chantier_id = $${idx++}`; params.push(chantier_id); }
    if (mois && annee) {
      sql += ` AND TO_CHAR(d.date::date, 'MM') = $${idx++} AND TO_CHAR(d.date::date, 'YYYY') = $${idx++}`;
      params.push(mois.padStart(2, '0'), annee);
    }
    sql += ' ORDER BY d.date DESC';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { date, chantier_id, categorie, montant, note } = req.body;
    if (!date || !chantier_id || !categorie || !montant) {
      return res.status(400).json({ error: 'Champs requis: date, chantier_id, categorie, montant' });
    }
    if (montant <= 0) {
      return res.status(400).json({ error: 'Le montant doit être supérieur à 0' });
    }
    if (!['materiaux','transport','nourriture','location','divers'].includes(categorie)) {
      return res.status(400).json({ error: 'Catégorie invalide' });
    }
    const result = await pool.query(
      'INSERT INTO depenses (date, chantier_id, categorie, montant, note) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [date, chantier_id, categorie, montant, note || null]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT d.*, c.nom as chantier_nom FROM depenses d JOIN chantiers c ON d.chantier_id = c.id WHERE d.id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Dépense introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { date, chantier_id, categorie, montant, note } = req.body;
    const existing = (await pool.query('SELECT * FROM depenses WHERE id = $1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Dépense introuvable' });
    if (montant !== undefined && montant <= 0) {
      return res.status(400).json({ error: 'Le montant doit être supérieur à 0' });
    }
    if (categorie && !['materiaux','transport','nourriture','location','divers'].includes(categorie)) {
      return res.status(400).json({ error: 'Catégorie invalide' });
    }
    await pool.query(
      'UPDATE depenses SET date=$1, chantier_id=$2, categorie=$3, montant=$4, note=$5 WHERE id=$6',
      [
        date ?? existing.date,
        chantier_id ?? existing.chantier_id,
        categorie ?? existing.categorie,
        montant ?? existing.montant,
        note !== undefined ? note : existing.note,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const existing = (await pool.query('SELECT * FROM depenses WHERE id = $1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Dépense introuvable' });
    await pool.query('DELETE FROM depenses WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
