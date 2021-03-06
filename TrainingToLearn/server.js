const express = require('express')
const app = express()
const port = 3000
const cors = require("cors")



var routes = require('./routes/index');
var maintenance = require('./routes/maintenance');
var allowedOrigins = ['http://localhost:8080', 'http://localhost:8081'];

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },

    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],

    credentials: true,
}))

app.use(express.json())
app.use('/', routes)
app.use('/maintenance', maintenance)


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})