const axios = require("axios").default;
const { intervalTime } = require("./options");

module.exports = url =>
  new Promise(resolve => {
    console.log("// | cooldown...");
    setTimeout(() => {
      console.log("// | start");
      axios.get(url).then(x => {
        console.log("// | ok");
        resolve(x.data);
      });
    }, intervalTime);
  });
