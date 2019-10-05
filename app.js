const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');

mongoose.promise = global.Promise;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) {
    app.use(errorHandler());
}

mongoose.connect('mongodb://localhost/brodb', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);

require('./models/Users');
require('./config/passport');
app.use(require('./routes'));

if(!isProduction) {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);

        res.json({
        errors: {
            message: err.message,
            error: err,
        },
        });
    });
}

module.exports = app;
