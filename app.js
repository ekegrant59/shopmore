require('dotenv').config()
const ejs = require('ejs')
const mongoose = require('mongoose')
const express = require('express')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const session = require('cookie-session')
const adminschema = require('./schema/adminschema')
const waitlistschema = require('./schema/waitlistschema')

const adminkey = process.env.ADMINKEY

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
app.get('/waitlist', (req,res)=>{
    res.render('waitlist')
})
app.get('/faq', (req,res)=>{
    res.render('faq')
})
app.get('/support', (req,res)=>{
    res.render('support')
})

app.get('/adminregister', (req,res)=>{
    res.render('adminregister')
})

app.post('/adminregister', async(req,res)=>{
    const regInfo = req.body
    const password = regInfo.password
  
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
  
      run()
      async function run(){
          try {
              const admin = new adminschema({
                  email: regInfo.email,
                  password: hashedPassword
              })
              await admin.save()
              res.redirect('/admin')
          }
          catch (err) {
            console.log(err.message)
            req.flash('danger','An Error Occured,Please try again')
            res.redirect('/adminregister')
          
          }
      }
})

app.get('/admin',protectAdminRoute, async (req,res)=>{
    try{
      const waitlists = await waitlistschema.find()
        res.render('admin', {waitlists: waitlists})
    } catch(err){
        console.log(err)
    }
})
    
function protectAdminRoute(req, res, next){
  const token = req.cookies.admintoken
  try{
      const user = jwt.verify(token, adminkey)

      req.user = user
      // console.log(req.user)
      next()
  }
  catch(err){
      res.clearCookie('admintoken')
      return res.render('adminlogin')
  }
}

app.post('/adminlogin', (req,res)=>{
  const loginInfo = req.body

  const email = loginInfo.email
  const password = loginInfo.password

  adminschema.findOne({email})
  .then((admin)=>{
      adminschema.findOne({email: email}, (err,details)=>{
          if(!details){
              req.flash('danger','Incorrect email')
              res.redirect('/admin')
          } else{
              bcrypt.compare(password, admin.password, async (err,data)=>{
                  if(data){
                      const payload1 = {
                          user:{
                              email: admin.email
                          }
                      }
                      const token1 = jwt.sign(payload1, adminkey,{
                          expiresIn: '3600s'
                      })

                      res.cookie('admintoken', token1, {
                          httpOnly: false
                      })

                      res.redirect('/admin')
                  } else{
                      req.flash('danger', 'incorrect password')
                      res.redirect('/admin')
                  }
              })
          }
      })
  }).catch((err)=>{
      console.log(err)
  })
})


const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`App started on port ${port}`)
})