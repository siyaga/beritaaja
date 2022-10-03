var express = require('express');
var router = express.Router();
const multer = require('multer');
var bcrypt = require('bcrypt');
// const auth = require('../auth');



const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, '././public/images');
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
const Komentars = db.komentars;
const Users = db.users;
const Op = db.Sequelize.Op;
/* GET home page. */
router.get('/', function (req, res, next) {
  Beritas.findAll()
  .then(beritas => {
    res.render('index', {
      title: 'Berita Terkini',
      beritas: beritas
    });
  })
  .catch(err=> {
    res.render('index', { 
      title: 'Berita Terkini',
    });
  });
  
});
// find berita
router.get('/berita/:id', function (req, res, next) {
  const id = req.params.id;
  Beritas.findByPk(id)
  .then(detailProduct => {
      if(detailProduct){
        res.render('berita', {
          title: 'Judul Berita',
          beritas: detailProduct,
          komentars: 
          Komentars.findAll({where:{idberita:id}})
        });
      }else{
          res.status(404).send({
              message: "tidak ada id="+id
          })
      }
  })
  .catch(err => {
    res.render('index', { 
      title: 'Berita Terkini',
      beritas:[]
    });
  });

});

// Post berita baru
router.post('/komentar', function (req, res, next) {

  let komentar = {
    idberita: req.body.idberita,
    username: req.body.username,
    komentar: req.body.komentar
  }
  Komentars.create(komentar)
    .then(data => {
      res.redirect(`/berita/${req.body.idberita}`);
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      })
    });
});
router.get('/deleteberita/:id', function (req, res, next) {
  const id = req.params.id;
  Beritas.destroy({
    where:{
      id:id
    }
  })
  .then(detailProduct => {
      if(detailProduct){
        res.redirect('/dashboard');
      }else{
          res.status(404).send({
              message: "tidak ada id="+id
          })
      }
  })
  .catch(err => {
    res.render('index', { 
      title: 'Berita Terkini',
      beritas:[]
    });
  })

});

// setting dashboard
router.get('/dashboard/', function (req, res, next) {
  Beritas.findAll()
  .then(beritas => {
    res.render('dashboard', 
    {
      title: 'Dashboard Berita',
      beritas: beritas
    });
  })
  .catch(err=> {
    res.render('dashboard', { 
      title: 'Daftar Berita',
      beritas:[]
    });
  });
 
});
// go to page addberita
router.get('/dashboard/addberita', function (req, res, next) {
  res.render('addberita', {
    title: 'Posting Berita Baru'
  });
});
// Post berita baru
router.post('/dashboard/addberita', kirim.array('image', 1), function (req, res, next) {
  let image = req.files[0].filename;
  
  let berita = {
    judul: req.body.judul,
    author: req.body.author,
    image: image,
    artikel: req.body.artikel
  }
  Beritas.create(berita)
    .then(data => {
      res.redirect('/dashboard');
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      })
    });
});
router.get('/deleteberita/:id', function (req, res, next) {
  const id = req.params.id;
  Beritas.destroy({
    where:{
      id:id
    }
  })
  .then(detailProduct => {
      if(detailProduct){
        res.redirect('/dashboard');
      }else{
          res.status(404).send({
              message: "tidak ada id="+id
          })
      }
  })
  .catch(err => {
    res.render('index', { 
      title: 'Berita Terkini',
      beritas:[]
    });
  })

});

// go to page Edit berita
router.get('/dashboard/editberita/:id', function (req, res, next) {
  const id = req.params.id;
  Beritas.findByPk(id)
  .then(berita => {
      if(berita){
        res.render('editberita', {
          title: 'Update Berita',
          beritas: berita
        });
      }else{
          res.status(404).send({
              message: "tidak ada id="+id
          })
      }
  })
  .catch(err => {
    res.render('editberita', { 
      title: 'Update Berita',
      beritas:[]
    });
  });
});
// Post Edit berita
router.post('/dashboard/editberita/:id', kirim.array('image', 1), function (req, res, next) {
  const id = req.params.id;
  let image = req.files[0].filename;
  let berita = {
    judul: req.body.judul,
    author: req.body.author,
    image: image,
    artikel: req.body.artikel
  }
  Beritas.update(berita, {
      where: {id: id}
  })
  .then(num => {
      res.redirect('/dashboard');
  })
  .catch(err => {
      res.json({
          info:"Error",
          message: err.message
      });
  })
});

// delete Berita
router.get('/dashboard/deleteberita/:id', function (req, res, next) {
  const id = req.params.id;
  Beritas.destroy({
    where:{
      id:id
    }
  })
  .then(detailProduct => {
      if(detailProduct){
        res.redirect('/dashboard');
      }else{
          res.status(404).send({
              message: "tidak ada id="+id
          })
      }
  })
  .catch(err => {
    res.render('index', { 
      title: 'Berita Terkini',
      beritas:[]
    });
  })

});




module.exports = router;