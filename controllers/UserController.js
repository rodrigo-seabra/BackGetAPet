const User = require("../models/User");

//import bcrypt
const bcrypt = require("bcrypt");

//import jwt
const jwt = require("jsonwebtoken");

/** IMPORT DOS HELPERS
 * import da funcao de token
 */
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
  static async register(req, res) {
    //destructor
    const { name, email, phone, password, confirmpassword } = req.body;

    //VALIDATIONS
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }

    if (!email) {
      res.status(422).json({ message: "O email é obrigatório!" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }
    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório!" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória!" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }
    if (!confirmpassword) {
      res
        .status(422)
        .json({ message: "A confirmação de senha é obrigatória!" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }

    //validando as senhas
    if (password !== confirmpassword) {
      res.status(422).json({
        message: "A senha e a confirmação de senha precisam ser iguais!",
      }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }
    //check if user exists - verificando se o user existe
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      res.status(422).json({
        message: "Por favor utilize outro e-mail",
      }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }

    //CREATE A PASSWORD - pois nunca salvamos a senha do user no banco
    const salt = await bcrypt.genSalt(12); //12 caracteres a mais
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();

      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    //validations
    if (!email) {
      res.status(422).json({ message: "O email é obrigatório!" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória!" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }

    //check if user exists - verificando se o user existe
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(422).json({
        message: "Não há usuário cadastrado com esse e-mail",
      }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }

    //check if password match with db password
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({
        message: "Senha inválida",
      }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }

    await createUserToken(user, req, res);
  }
  static async checkUser(req, res) {
    let currentUser;
    console.log(req.headers.authorization);
    // OS TOKENS são passados no header dentro de authorization

    if (req.headers.authorization) {
      const token = getToken(req);

      const decoded = jwt.verify(token, "nossosecret");

      currentUser = await User.findById(decoded.id);

      //removendo a senha da resposta
      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password"); //método select do mongoose, onde eu passo dentro de ("") um string com o simbolo de - e em seguida o nome do campo que eu desejo remover

    if (!user) {
      res.status(422).json({
        message: "Usuário não encontrado",
      });
      return;
    }

    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;

    //check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);
    const { name, email, phone, password, confirmpassword } = req.body;

    if (req.file) {
      user.image = req.file.filename;
    }

    //VALIDATIONS
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório!" });
      return;
    }

    user.name = name;

    if (!email) {
      res.status(422).json({ message: "O e-mail é obrigatório!" });
      return;
    }

    // check if user exists
    const userExists = await User.findOne({ email: email });

    if (user.email !== email && userExists) {
      res.status(422).json({ message: "Por favor, utilize outro e-mail!" });
      return;
    }

    user.email = email;
    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório!" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }

    if (password != confirmpassword) {
      res.status(422).json({ message: "As senhas não conferem" }); //422 - requisição realizada porém o servidor não consegue processá-la
      return;
    }
    // ou seja, se o user mandou a senha certa e deseja realmente mudá-la
    else if (password === confirmpassword && password != null) {
      //CREATE A PASSWORD - pois nunca salvamos a senha do user no banco
      const salt = await bcrypt.genSalt(12); //12 caracteres a mais
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    //try catch que valida se as alterações deram certo ou errado
    try {
      //returns user updated data

      const updatedUser = await User.findByIdAndUpdate(
        { _id: user._id },
        { $set: user }, //os dados que serão atualizados
        { new: true } // parametros para atualizar os dados com sucesso
      );

      res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: error });
    }

    console.log(user);
  }
};
