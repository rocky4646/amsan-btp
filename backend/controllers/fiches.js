const pool = require('../database/db');

exports.calculate = async (req, res) => {
  try {
    const { ouvrier_id, mois, annee } = req.query;
    if (!ouvrier_id || !mois || !annee) {
      return res.status(400).json({ error: 'Paramètres requis: ouvrier_id, mois, annee' });
    }

    const ouvrier = (await pool.query('SELECT * FROM ouvriers WHERE id = $1', [ouvrier_id])).rows[0];
    if (!ouvrier) return res.status(404).json({ error: 'Ouvrier introuvable' });

    const moisPad = mois.padStart(2, '0');
    const dateDebut = `${annee}-${moisPad}-01`;
    const dateFin = `${annee}-${moisPad}-31`;

    const pointages = (await pool.query(
      `SELECT COUNT(*) as jours_travailles, COALESCE(SUM(p.hs), 0) as total_hs
       FROM pointages p
       WHERE p.ouvrier_id = $1 AND p.present = 1 AND p.date >= $2 AND p.date <= $3`,
      [ouvrier_id, dateDebut, dateFin]
    )).rows[0];

    const avances = (await pool.query(
      `SELECT COALESCE(SUM(montant), 0) as total_avances
       FROM avances
       WHERE ouvrier_id = $1 AND date >= $2 AND date <= $3`,
      [ouvrier_id, dateDebut, dateFin]
    )).rows[0];

    const jours = parseInt(pointages.jours_travailles);
    const total_hs = parseFloat(pointages.total_hs);
    const total_avances = parseFloat(avances.total_avances);
    const salaire_journalier = parseFloat(ouvrier.salaire_journalier);
    const tarif_hs = parseFloat(ouvrier.tarif_hs);

    const salaire_normal = jours * salaire_journalier;
    const montant_hs = total_hs * tarif_hs;
    const salaire_brut = salaire_normal + montant_hs;
    const net_a_payer = salaire_brut - total_avances;

    res.json({
      ouvrier: { id: ouvrier.id, nom: ouvrier.nom, prenom: ouvrier.prenom, poste: ouvrier.poste },
      periode: { mois, annee },
      salaire_journalier,
      tarif_hs,
      jours_travailles: jours,
      total_hs,
      salaire_normal: Math.round(salaire_normal * 100) / 100,
      montant_hs: Math.round(montant_hs * 100) / 100,
      salaire_brut: Math.round(salaire_brut * 100) / 100,
      total_avances,
      net_a_payer: Math.round(net_a_payer * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
