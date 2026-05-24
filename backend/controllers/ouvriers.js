const pool = require('../database/db');

exports.list = async (req, res) => {
  try {
    const actif = req.query.actif;
    let sql = 'SELECT * FROM ouvriers';
    const params = [];
    if (actif !== undefined) {
      sql += ' WHERE actif = $1';
      params.push(actif === '1' ? 1 : 0);
    }
    sql += ' ORDER BY nom ASC';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ouvriers WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Ouvrier introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nom, prenom, cin, telephone, poste, salaire_journalier, tarif_hs } = req.body;
    if (!nom || !salaire_journalier || !tarif_hs) {
      return res.status(400).json({ error: 'Champs requis: nom, salaire_journalier, tarif_hs' });
    }
    if (salaire_journalier <= 0 || tarif_hs <= 0) {
      return res.status(400).json({ error: 'Les montants doivent être supérieurs à 0' });
    }
    const result = await pool.query(
      'INSERT INTO ouvriers (nom, prenom, cin, telephone, poste, salaire_journalier, tarif_hs) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [nom, prenom || null, cin || null, telephone || null, poste || null, salaire_journalier, tarif_hs]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nom, prenom, cin, telephone, poste, salaire_journalier, tarif_hs, actif } = req.body;
    const existing = (await pool.query('SELECT * FROM ouvriers WHERE id = $1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Ouvrier introuvable' });

    if (salaire_journalier !== undefined && salaire_journalier <= 0) {
      return res.status(400).json({ error: 'Le salaire journalier doit être supérieur à 0' });
    }
    if (tarif_hs !== undefined && tarif_hs <= 0) {
      return res.status(400).json({ error: 'Le tarif HS doit être supérieur à 0' });
    }

    await pool.query(
      `UPDATE ouvriers SET nom=$1, prenom=$2, cin=$3, telephone=$4, poste=$5, salaire_journalier=$6, tarif_hs=$7, actif=$8 WHERE id=$9`,
      [
        nom ?? existing.nom,
        prenom !== undefined ? prenom : existing.prenom,
        cin !== undefined ? cin : existing.cin,
        telephone ?? existing.telephone,
        poste ?? existing.poste,
        salaire_journalier ?? existing.salaire_journalier,
        tarif_hs ?? existing.tarif_hs,
        actif !== undefined ? actif : existing.actif,
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
    const existing = (await pool.query('SELECT * FROM ouvriers WHERE id = $1', [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: 'Ouvrier introuvable' });

    const check = (await pool.query('SELECT COUNT(*) as count FROM pointages WHERE ouvrier_id = $1', [req.params.id])).rows[0];
    if (parseInt(check.count) > 0) {
      return res.status(409).json({ error: 'Impossible de supprimer : cet ouvrier a des pointages' });
    }

    await pool.query('DELETE FROM ouvriers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
