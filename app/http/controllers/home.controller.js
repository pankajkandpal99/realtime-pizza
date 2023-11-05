const Menue = require("../../models/menue.model");

function homeController() {
  return {
    async index(req, res) {
      try {
        const pizzas = await Menue.find();
        // console.log(pizzas);
        res.render("home.ejs", { pizzas });
      } catch (err) {
        console.log("Error fetching data : ", err);
        res.status(500).send("An error occured while fetching data.");
      }
    },
  };
}

module.exports = homeController;
