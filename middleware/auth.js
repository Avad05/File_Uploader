module.exports = {
    ensureAuthenticated: function(req, req, next){
        if (req.isAuthenticated()){
            return(next);
        }
    }
}