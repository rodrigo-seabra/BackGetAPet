const mongoose = require("../db/conn");
const { Schema } = require("mongoose");

const User = mongoose.model(
  "User",
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      image: {
        type: String,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    { timestamps: true } //serve para criar dois dados, como as duas colunas do sql para saber a data de criação e a de atualização
  )
);

module.exports = User;
