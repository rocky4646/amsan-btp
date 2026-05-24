CREATE TABLE IF NOT EXISTS ouvriers (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT,
  cin TEXT,
  telephone TEXT,
  poste TEXT,
  salaire_journalier NUMERIC NOT NULL CHECK(salaire_journalier > 0),
  tarif_hs NUMERIC NOT NULL CHECK(tarif_hs > 0),
  actif INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS chantiers (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  ville TEXT,
  responsable TEXT,
  date_debut TEXT,
  statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif', 'termine', 'archive'))
);

CREATE TABLE IF NOT EXISTS pointages (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  ouvrier_id INTEGER NOT NULL,
  chantier_id INTEGER NOT NULL,
  present INTEGER DEFAULT 0,
  hs NUMERIC DEFAULT 0 CHECK(hs >= 0),
  UNIQUE(date, ouvrier_id),
  FOREIGN KEY (ouvrier_id) REFERENCES ouvriers(id) ON DELETE RESTRICT,
  FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS depenses (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  chantier_id INTEGER NOT NULL,
  categorie TEXT CHECK(categorie IN ('materiaux','transport','nourriture','location','divers')),
  montant NUMERIC NOT NULL CHECK(montant > 0),
  note TEXT,
  FOREIGN KEY (chantier_id) REFERENCES chantiers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS avances (
  id SERIAL PRIMARY KEY,
  ouvrier_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  montant NUMERIC NOT NULL CHECK(montant > 0),
  note TEXT,
  FOREIGN KEY (ouvrier_id) REFERENCES ouvriers(id) ON DELETE RESTRICT
);
