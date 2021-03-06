const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req, res, next){
  // get tokenn from header
  const token = req.header('x-auth-token')

  //  if no token found
  if(!token){
    return res.status(401).json({msg: "no token, authorization denied"})
  }

  // verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"))

    req.user = decoded.user
    next();
  } catch (error) {
    res.status(401).json({msg: "Token not Valid"})
  }
}