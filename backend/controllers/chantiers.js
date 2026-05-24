const pool = require('../database/db');

exports.list = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chantiers ORDER BY nom ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chantiers WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Chantier introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nom, ville, responsable, date_debut } = req.body;
    if (!nom) return res.status(400).json({ error: 'Le nom du chantier est requis' });

    const result = await pool.query(
      'INSERT INTO chantiers (nom, ville, responsable, date_debut) VALUES ($1, $2, $3, $4) RETURNING id',
      [nom, ville || null, responsable || null, date_debut || null]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nom, ville, responsable, date_debut, statut } = req.body;
    const existing = (await pool.query('SELECT * FROM chantiers WHERE id = $1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Chantier introuvable' });

    if (statut && !['actif', 'termine', 'archive'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    await pool.query(
      'UPDATE chantiers SET nom=$1, ville=$2, responsable=$3, date_debut=$4, statut=$5 WHERE id=$6',
      [
        nom ?? existing.nom,
        ville ?? existing.ville,
        responsable ?? existing.responsable,
        date_debut ?? existing.date_debut,
        statut ?? existing.statut,
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
    const existing = (await pool.query('SELECT * FROM chantiers WHERE id = $1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Chantier introuvable' });

    await pool.query('DELETE FROM chantiers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
