//init express server
const express = require('express');

const demo = express();

demo.set('view engine', 'ejs');

//request response function
demo.get('/', (req, res) => {
    res.render('index');
});

const port = 2000;

demo.listen(port, () => console.log(`Server running on port ${port}`))