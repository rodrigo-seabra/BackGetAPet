const router = require("express").Router();
const UserController = require("../controllers/UserController.js");

//middleware
const verifyToken = require("../helpers/verify-token.js");

//upload de imagem
const { imageUpload } = require("../helpers/image-upload.js");

router.post("/register", UserController.register);
router.get("/checkuser", UserController.checkUser);
router.get("/:id", UserController.getUserById);
router.post("/login", UserController.login);
//rota protegida
router.patch(
  "/edit/:id",
  verifyToken,
  imageUpload.single("image"), //estou dizendo que em image upload, vou receber uma unica image = single e o campo enviado no formulário é image, se isso acontecer ele vai jogar isso aqui
  UserController.editUser
);

module.exports = router;
