const auth = function(req, res, next) {
    if(req.session && req.session.islogin){
        // sudah login

        return next();
    }else {
        // belum login
        return res.sendStatus(401);
    }
}
module.exports = auth;