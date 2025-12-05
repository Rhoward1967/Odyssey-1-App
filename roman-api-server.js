const express = require('express');
const cors = require('cors');
const { getRomanStatus } = require('../services/RomanSystemContext');

const app = express();
app.use(cors());

app.get('/api/romanStatus', (req, res) => {
  try {
    const status = getRomanStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch R.O.M.A.N. status' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`ROMAN API server running on port ${PORT}`);
});
