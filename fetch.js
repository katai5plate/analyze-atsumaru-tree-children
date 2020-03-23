const axios = require("axios").default;
const { intervalTime } = require("./options");

module.exports = url =>
  new Promise(resolve => {
    setTimeout(() => {
      axios.get(url).then(x => resolve(x.data));
    }, intervalTime);
  });
