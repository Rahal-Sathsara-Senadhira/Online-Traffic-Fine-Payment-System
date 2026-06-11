require('dotenv').config();
require('./config/env');

const app = require('./app');

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Traffic Fine API running on port ${PORT}`);
});
