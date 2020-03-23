const { intervalTime } = require("./options");

module.exports = async (list, cb) => {
  let res = [];
  let index = 0;
  for (const elm of list) {
    index++;
    res.push(await cb(elm, index, list));
  }
  return res;
};
