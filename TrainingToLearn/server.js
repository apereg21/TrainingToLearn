const express = require('express')
const app = express()
const port = 3000

var routes = require('./routes/blockchain');
var mantenimineto = require('./routes/mantenimiento');

app.use(express.json())
app.use('/', routes)
app.use('/', mantenimineto)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})