require('dotenv').config()
const ejs = require('ejs')
const mongoose = require('mongoose')
const express = require('express')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const session = require('cookie-session')

const app = express()
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.json())
app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: 'secret',
    })
);

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.set('view engine', 'ejs')
app.use('/assets', express.static('assets'))

app.get('/', (req,res)=>{
    res.render('index')
})

const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`App started on port ${port}`)
})