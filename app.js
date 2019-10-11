const express = require('express');
const db = require('mysql-promise')();
const morgan = require('morgan');
let path =require('path');
const app = express();
let PORT = 8080;

app.use(morgan('dev'));

db.configure({
    user: 'guest',
    password: 'GHE3FJU',
    host: '63.33.172.234',
    port: '3554',
    database: 'tradair'
})

app.get('/data', async (req, res, err) => {
    try {
       const result = await db.query('SELECT rates.time_created, rates.rate, currency_pairs.name FROM currency_pairs ' +
       'JOIN rates ON rates.currency_pair_id = currency_pairs.id '+
       'WHERE currency_pairs.name IN ("EUR/USD", "EUR/BTC", "EUR/ILS") AND rates.time_created > (SELECT MAX(time_created) FROM rates) - 7 '+
       'ORDER BY rates.time_created')
       .spread(rows => rows);
         res.json(result);
    } catch(err) {
        console.log(err);
        res.json([]);
    }
})


app.use('/', express.static(path.join(__dirname, '/public')))



app.listen(PORT, () => {
    console.log(`up and listening on ${PORT}`)
})