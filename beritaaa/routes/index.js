var express = require('express');
var router = express.Router();
const multer = require('multer');
var bcrypt = require('bcrypt');
const auth = require('../auth');
const notauth = require('../notauth');
const moment = require('moment');
const {
  body,
  check,
  validationResult
} = require('express-validator');

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
});

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

  username = req.session.username;
  Beritas.findAll({
    order: [
      ['createdAt', 'DESC']
    ]
  })
    .then(beritas => {
      res.render('index', {
        title: 'Berita Terkini',
        beritas: beritas,
        username: username,
        moment: moment,
      });
    })
    .catch(err => {
      res.render('index', {
        title: 'Berita Terkini'
      });
    });

});

// find berita
router.get('/berita/:id', async function (req, res, next) {
  const id = req.params.id;

  username = req.session.username;
  const komentarsss = await Komentars.findAll({
    where: {
      idberita: id
    }
  });
  await Beritas.findByPk(id)
    .then(detailProduct => {
      if (detailProduct) {
        res.render('berita', {
          title: 'Judul Berita',
          beritas: detailProduct,
          komentars: komentarsss,
          moment: moment,
          username: username
        });
      } else {
        res.status(404).send({
          message: "tidak ada id=" + id
        })
      }
    })
    .catch(err => {
      res.render('index', {
        title: 'Berita Terkini',
        beritas: []
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
// setting dashboard
router.get('/dashboard/', auth, function (req, res, next) {
  username = req.session.username;
  Beritas.findAll({where:{author:username}})
    .then(beritas => {
      res.render('dashboard', {
        title: 'Dashboard Berita',
        beritas: beritas,
        username: username
      });
    })
    .catch(err => {
      res.render('dashboard', {
        title: 'Daftar Berita',
        beritas: []
      });
    });

});
// go to page addberita
router.get('/dashboard/addberita', auth, function (req, res, next) {

  username = req.session.username;
  res.render('addberita', {
    title: 'Posting Berita Baru',
    username: username
  });
});
// Post berita baru
router.post('/dashboard/addberita', auth, kirim.array('image', 1), [
  check('judul')
  .notEmpty().withMessage('Judul harus diisi.'),
  check('artikel')
  .notEmpty().withMessage('Artikel harus diisi.')


], function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('addberita', {
      title: 'Posting Berita Baru',
      errors: errors.array(),
      username: username,
      data: req.body

    });
  } else {

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
  };
});

// go to page Edit berita
router.get('/dashboard/editberita/:id', auth, function (req, res, next) {
  const id = req.params.id;
  username = req.session.username;
  Beritas.findByPk(id)
    .then(berita => {
      if (berita) {
        res.render('editberita', {
          title: 'Update Berita',
          beritas: berita,
          username: username
        });
      } else {
        res.status(404).send({
          message: "tidak ada id=" + id
        })
      }
    })
    .catch(err => {
      res.render('editberita', {
        title: 'Update Berita',
        beritas: []
      });
    });
});
// Post Edit berita
router.post('/dashboard/editberita/:id', auth, kirim.array('image', 1),
  [
    check('judul')
    .notEmpty().withMessage('Judul harus diisi.'),
    check('artikel')
    .notEmpty().withMessage('Artikel harus diisi.')


  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('editberita', {
        title: 'Update Berita',
        errors: errors.array(),
        username: username,

      });
    } else {

      const id = req.params.id;
      let image = req.files[0].filename;
      let berita = {
        judul: req.body.judul,
        author: req.body.author,
        image: image,
        artikel: req.body.artikel
      }
      Beritas.update(berita, {
          where: {
            id: id
          }
        })
        .then(num => {
          res.redirect('/dashboard');
        })
        .catch(err => {
          res.json({
            info: "Error",
            message: err.message
          });
        });
    }
  });

// delete Berita
router.get('/dashboard/deleteberita/:id', auth, function (req, res, next) {
  const id = req.params.id;
  Beritas.destroy({
      where: {
        id: id
      }
    })
    .then(detailProduct => {
      if (detailProduct) {
        res.redirect('/dashboard');
      } else {
        res.status(404).send({
          message: "tidak ada id=" + id
        })
      }
    })
    .catch(err => {
      res.render('index', {
        title: 'Berita Terkini',
        beritas: []
      });
    })

});

router.get('/register', notauth, function (req, res, next) {
  username = req.session.username;
  res.render('register', {
    title: 'Register User',
    username: username
  });
})



// create Berita
router.post('/register', notauth, [
  check('nama')
  .notEmpty().withMessage('Nama harus diisi.'),
  body('email').custom(async (valueEmail, ) => {

    // Mencari nama yang sama di query

    const Email = await Users.findOne({
      where: {
        email: valueEmail
      }
    });
    if (Email) {
      throw new Error(`Email ${valueEmail} sudah terdaftar! `);

    }

    return true;
  })
  .notEmpty().withMessage('Email harus diisi.')
  .isEmail().withMessage('Email tidak valid.'),
  body('username').custom(async (valueUsername) => {
    // Mencari nama yang sama di query
    const username = await Users.findOne({
      where: {
        username: valueUsername
      }
    });


    if (username) {
      throw new Error(`Username ${valueUsername} sudah terdaftar! `);

    }

    return true;
  })
  .notEmpty().withMessage('Username harus diisi.')
  .isLength({
    max: 20
  }).withMessage('Username maximal Harus 20 karakter.'),
  check('password')
  .notEmpty().withMessage('Password harus diisi.')
  .isLength({
    min: 6
  }).withMessage('password minimal Harus 6 karakter.'),





], function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('register', {
      title: 'Register User',
      errors: errors.array(),
      username: username,
      data: req.body,

    });
  } else {

    let passwordHash = bcrypt.hashSync(req.body.password, 10);
    let user = {
      nama: req.body.nama,
      email: req.body.email,
      username: req.body.username,
      password: passwordHash
    }
    Users.create(user)
      .then(data => {
        // res.flash('msg', 'Berhasil Melakukan Registrasi Silakan Lakukan login');
        res.redirect('/login');
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        });
      });

  }

});

/* GET users listing. */
router.get('/login', notauth, function (req, res, next) {
  username = req.session.username;
  
  res.render('login', {
    title: 'Login User',
    username: username,
    msg: req.flash('msg')
  });
});

// // create Berita
// router.post('/login', notauth, async function (req, res, next) {
//   username = req.session.username;
//   const musername = req.body.username;
//   const mpassword = req.body.password;

//   const errors = [];
//   if(musername === undefined){
//     errors.push({message: "Harap Isi Username"})
//   }
//   if(mpassword === undefined){
//     errors.push({message: "Harap Isi Username"})
//   }
//   if (errors.length > 0) {
//        res.render('login', {
//             errors,
//             title: 'Login User',
//             username: username,
//             msg: req.flash('msg')
//     });
//   }else {
//   const checkusername = await Users.findOne({where:{username:req.body.username}});
//   if(checkusername){
//     var loginValid = bcrypt.compareSync(req.body.password, checkusername.password);

//     if (loginValid) {
//       req.session.username = req.body.username;
//       req.session.islogin = true;
//       res.redirect('/dashboard');
//     }else {
//       errors.push({message: "Username dan Password Salah"});
//        res.render('login', {
//             errors,
//             title: 'Login User',
//             username: username,
//             msg: req.flash('msg')
//     });
      
//     }
//   }
// }

// });

// // create Berita
router.post('/login', notauth,function (req, res, next) {
  username = req.session.username;
  
  Users.findOne({
      where: {
        username: req.body.username
      }
    })
    .then(data => {
      if (data) {
        var loginValid = bcrypt.compareSync(req.body.password, data.password);

        if (loginValid) {
          // simpan session
          req.session.username = req.body.username;
          req.session.islogin = true;
          res.redirect('/dashboard');
        } else {
          let message = 'Username tidak boleh kosong'
    return res.render('login', {
      
      title: 'Login User',
      username: username,
      message: message,
      msg: req.flash('msg')
      });
        }

      } else {
        res.redirect('/login');
      }
    })
    .catch(err => {
      res.redirect('/login');
    })


});

/* logout user. */
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/login');
});




module.exports = router;