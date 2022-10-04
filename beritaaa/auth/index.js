
const auth = function(req, res, next){
    
    console.log(req.session.username)
	if(req.session && req.session.islogin) {
		// sudah login
		// tambahin logic

		return next();
	}else {
		// belum login
		return res.redirect('/login');
	}
};


module.exports = auth;