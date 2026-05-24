require('dotenv').config();
const express = require('express');
const path = require('path');

const ouvriersRoutes = require('./routes/ouvriers');
const chantiersRoutes = require('./routes/chantiers');
const pointagesRoutes = require('./routes/pointages');
const depensesRoutes = require('./routes/depenses');
const avancesRoutes = require('./routes/avances');
const fichesRoutes = require('./routes/fiches');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/ouvriers', ouvriersRoutes);
app.use('/api/chantiers', chantiersRoutes);
app.use('/api/pointages', pointagesRoutes);
app.use('/api/depenses', depensesRoutes);
app.use('/api/avances', avancesRoutes);
app.use('/api/fiches', fichesRoutes);

// Pour le dev local uniquement
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AMSAN BTP - Serveur lancé sur http://localhost:${PORT}`);
  });
}

module.exports = app;
