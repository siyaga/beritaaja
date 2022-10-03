var express = require('express');
var router = express.Router();
const multer = require('multer');
var bcrypt = require('bcrypt');
// const auth = require('../auth');



const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/image');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().getTime() + '-' + file.originalname);
  }
});


const kirim = multer({
  storage: fileStorage
})

const db = require('../models');
const {
  request
} = require('../app');
const Beritas = db.beritas;
const Users = db.users;
const Op = db.Sequelize.Op;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Berita Terkini'
  });
});
router.get('/judul/', function (req, res, next) {
  res.render('berita', {
    title: 'Judul Berita'
  });
});
router.get('/dashboard/', function (req, res, next) {
  res.render('dashboard', {
    title: 'Dashboard Berita'
  });
});
router.get('/dashboard/addberita', function (req, res, next) {
  res.render('addberita', {
    title: 'Dashboard Berita'
  });
});
router.post('/dashboard/addberita', kirim.array('image', 1), function (req, res, next) {
  let image = req.files[0].filename;
  
  let berita = {
    judul: req.body.judul,
    image: image,
    artikel: req.body.artikel
  }
  Beritas.create(berita)
    .then(data => {
      res.redirect('dashboard');
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      })
    });
});


module.exports = router;