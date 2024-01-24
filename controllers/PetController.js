const Pet = require("../models/Pet");

//import de helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const { use } = require("../routes/UserRoutes");
//helper do mongoose
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class PetController {
  //create a pet

  static async create(req, res) {
    const { name, age, weight, color } = req.body;
    const available = true;
    const images = req.files;

    //images upload

    //validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    }

    if (!age) {
      res.status(422).json({ message: "A idade é obrigatória" });
      return;
    }

    if (!weight) {
      res.status(422).json({ message: "O peso é obrigatório" });
      return;
    }

    if (!color) {
      res.status(422).json({ message: "A cor é obrigatória" });
      return;
    }

    if (images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatória" });
      return;
    }

    //get pet owner = pegando o dono do pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    //create a pet
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    /**Recebo um array cheio de metadados da image e aqui mapeio nesse array apenas os nomes das imagens (filenames) */
    images.map((image) => {
      pet.images.push(image.filename);
    });

    try {
      const newPet = await pet.save();
      res.status(200).json({ message: "Pet cadastrado com sucesso!", newPet });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async getAll(req, res) {
    const pets = await Pet.find().sort("-createdAt"); //sort é o método de ordenação, o menos (-) significa que ele vai pegar do mais novo para o mais velho

    res.status(200).json({ pets: pets });
  }

  static async getAllUserPets(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt"); //sort é o método de ordenação, o menos (-) significa que ele vai pegar do mais novo para o mais velho
    /**Filtrando por um objeto (subdocument) = são documentos que ficando dentro de outro documentos dentro do mongo db, para realizar o filtro primeiro passamos o nome campo no banco entre "" e depois passamos o valor normalmente */
    res.status(200).json({ pets: pets });
  }
  static async getAllUserAdoptions(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ "adopter._id": user._id }).sort("-createdAt"); //sort é o método de ordenação, o menos (-) significa que ele vai pegar do mais novo para o mais velho
    /**Filtrando por um objeto (subdocument) = são documentos que ficando dentro de outro documentos dentro do mongo db, para realizar o filtro primeiro passamos o nome campo no banco entre "" e depois passamos o valor normalmente */
    res.status(200).json({ pets: pets });
  }
  static async getPetById(req, res) {
    const id = req.params.id;

    //checando se o valor é um object id válido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Id inválido" });
      return;
    }

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado!" }); //404 - recurso não existe
      return;
    }
    res.status(200).json({
      pet: pet,
    });
  }
  static async removePetById(req, res) {
    const id = req.params.id;
    //checando se o valor é um object id válido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Id inválido" });
      return;
    }

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado!" }); //404 - recurso não existe
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:
          "Houve um problema ao processar a sua solicitação, tente novamente mais tarde!",
      });
      return;
    }
    await Pet.findByIdAndRemove(id);
    res.status(200).json({ message: "Pet removido com sucesso!" });
  }

  static async updatePet(req, res) {
    const id = req.params.id;
    const { name, age, weight, color, available } = req.body;
    const images = req.files;

    const updatedData = {}; // ficará os dados que serão atualizados dos pets durante esse processo

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado!" }); //404 - recurso não existe
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:
          "Houve um problema ao processar a sua solicitação, tente novamente mais tarde!",
      });
      return;
    }
    //validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    } else {
      updatedData.name = name;
    }

    if (!age) {
      res.status(422).json({ message: "A idade é obrigatória" });
      return;
    } else {
      updatedData.age = age;
    }

    if (!weight) {
      res.status(422).json({ message: "O peso é obrigatório" });
      return;
    } else {
      updatedData.weight = weight;
    }

    if (!color) {
      res.status(422).json({ message: "A cor é obrigatória" });
      return;
    } else {
      updatedData.color = color;
    }

    if (images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatória" });
      return;
    } else {
      updatedData.images = [];
      images.map((image) => {
        updatedData.images.push(image.filename);
      });
    }

    await Pet.findByIdAndUpdate(id, updatedData);

    res.status(200).json({ message: "Pet atualizado com sucesso!" });
  }

  static async schedule(req, res) {
    const id = req.params.id;

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado!" }); //404 - recurso não existe
      return;
    }

    //verificando se o pet é meu - check if user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.equals(user._id)) {
      res.status(422).json({
        message: "Você não pode agendar uma visita com o seu próprio pet!",
      });
      return;
    }

    //verificando se o user ja agendou uma visita - check if user has already scheduled a visit
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res.status(422).json({
          message: "Você já agendou uma visita para este Pet!",
        });
        return;
      }
    }

    //adicionar o user como adotante do pet - add user to pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Pet.findByIdAndUpdate(id, pet);

    res.status(200).json({
      message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`,
    });
  }

  static async concludeAdoption(req, res) {
    const id = req.params.id;
    //check if pet exists
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado!" }); //404 - recurso não existe
      return;
    }

    //verificando se o pet é do user
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:
          "Houve um problema ao processar a sua solicitação, tente novamente mais tarde!",
      });
      return;
    }
    pet.available = false;

    await Pet.findByIdAndUpdate(id, pet);

    res.status(200).json({
      message: "Parabéns! O ciclo de adoção foi finalizado com sucesso!",
    });
  }
};
