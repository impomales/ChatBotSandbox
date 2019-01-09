const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res, next) => {
    res.send('hello')
});

app.listen(PORT, () => {
    console.log(`app is listening on port: ${PORT}`);
});