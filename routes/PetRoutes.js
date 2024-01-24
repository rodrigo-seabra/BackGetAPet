const router = require("express").Router();

//import do controller
const PetController = require("../controllers/PetController");
const { imageUpload } = require("../helpers/image-upload.js");

//middlewares
const verifyToken = require("../helpers/verify-token");

//criacao de pet
router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetController.create
);

//pegando os pets
router.get("/", PetController.getAll);

//pegando os "meus" pets
router.get("/mypets", verifyToken, PetController.getAllUserPets);

//detalhes individuais
router.get("/:id", PetController.getPetById);

//rota de remoção do pet
router.delete("/:id", verifyToken, PetController.removePetById);

//rota que exibe os pets que o user quer adotar
router.get("/myadoptions", verifyToken, PetController.getAllUserAdoptions);

//rota de atualização
router.patch(
  "/:id",
  verifyToken,
  imageUpload.array("images"),
  PetController.updatePet
);

//marcando visitas para adoção
router.patch("/schedule/:id", verifyToken, PetController.schedule);
router.patch("/conclude/:id", verifyToken, PetController.concludeAdoption);

module.exports = router;
