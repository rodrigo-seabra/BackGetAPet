const jwt = require("jsonwebtoken");

//pegando os tokens
const getToken = require("./get-token");

//middleware to validate token - middleware, função quem ocorre entre a requisição e a resposta, e neste caso está servindo para verificar o token

const checkToken = (req, res, next) => {
  //verificando se veio o campo de autorização no header
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado!" });
  }

  const token = getToken(req);

  //verificando se há token no header
  if (!token) {
    return res.status(401).json({ message: "Acesso negado!" }); //401 = indica um problema nas credenciais de acesso à página
  }

  try {
    const verified = jwt.verify(token, "nossosecret");
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Token inválido!" }); // 400 =  é um código de erro exibido quando um navegador web envia uma solicitação incorreta para um servidor web
  }
};

module.exports = checkToken;
