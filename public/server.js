const express = require('express');
const path = require('path');
const app = express();

// Serve files from the 'public' directory
app.use(express.static(path.join(__dirname, '.')));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});