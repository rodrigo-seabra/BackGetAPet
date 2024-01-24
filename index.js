const express = require("express");
const cors = require("cors");

const app = express();

//configuração da resposta em json
app.use(express.json()); //nao precisa do url encoded pois só irá se comunicar em json mesmo

//Solve cors - resolvendo o problema de cors
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

//public folder for images - pasta publica para imagens
app.use(express.static("public"));

//import dos routes
const UserRoutes = require("./routes/UserRoutes");
const PetRoutes = require("./routes/PetRoutes");

app.use("/users", UserRoutes); //rotas de user
app.use("/pets", PetRoutes); //rotas de pets

app.listen(5000);
