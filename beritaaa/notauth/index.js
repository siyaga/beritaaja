
const notauth = function(req, res, next){
    
    console.log(req.session.username)
	if(req.session && req.session.islogin) {
		// sudah login
		// tambahin logic

		return res.redirect('/');
	}else {
		// belum login
        
		return next();
	}
};


module.exports = notauth;