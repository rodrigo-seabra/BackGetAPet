const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

const Pet = mongoose.model(
  "Pet",
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      weight: {
        type: Number,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      images: {
        type: Array, //forma de colocar multiplos dados em um campo - array
        required: true,
      },
      available: {
        type: Boolean,
      },
      user: Object, //inserido dados do user aqui - obs não estou fazendo relacionamento e sim inserindo os dados mesmo
      adopter: Object, //dado do adotante
    },
    { timestamps: true }
  )
);

module.exports = Pet;
