require('dotenv').config();
require('./config/env');

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Traffic Fine API running on port ${PORT}`);
});
