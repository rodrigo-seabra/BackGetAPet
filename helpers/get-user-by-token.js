const jwt = require("jsonwebtoken");
const User = require("../models/User");

//get user jwt token
const getUserByToken = async (token) => {
  if (!token) {
    return res.status(401).json({ message: "Acesso negado!" }); //401 = indica um problema nas credenciais de acesso à página
  }

  const decoded = jwt.verify(token, "nossosecret");

  const id = decoded.id;

  const user = await User.findById(id);

  return user;
};

module.exports = getUserByToken;
