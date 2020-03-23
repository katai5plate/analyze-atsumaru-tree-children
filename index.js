const fs = require("fs-extra");
const cheerio = require("cheerio");
const moment = require("moment");
const fetch = require("./fetch");
const step = require("./step");

const [, , type, limit = 100] = process.argv;

// 処理開始
(async () => {
  // バリデーション
  const TYPES = ["daily", "weekly", "monthly", "total"];
  if (!TYPES.includes(type)) return `${TYPES.join(" | ")} ?`;
  if (limit < 1 || 100 < limit) return `limit is 1-100`;

  // アツマールランキング API から目ぼしいデータだけ取り出す
  const API_RANKING = `https://public.api.nicovideo.jp/v1/rpgtkool/ranking.json?_limit=${limit}&rankingType=${type}`;
  console.log("// fetch:", API_RANKING);
  const toTimeText = time => moment(time * 1000).format("YYYY/MM/DD HH:mm:ss");
  const games = (await fetch(API_RANKING)).data.games.map(
    (
      {
        id,
        title,
        tags,
        score,
        playCount,
        commentCount,
        creatorName,
        creatorId,
        screenResolution: { width, height },
        releaseTime,
        upgradeTime
      },
      index
    ) => ({
      id,
      title,
      tags,
      score,
      playCount,
      commentCount,
      creatorName,
      creatorId,
      width,
      height,
      releaseTime: toTimeText(releaseTime),
      upgradeTime: toTimeText(upgradeTime),
      index
    })
  );
  console.log("// success!");

  // コンテンツツリーページから子作品数を取り出す
  const child = await step(
    games.map(({ id }) => `http://commons.nicovideo.jp/tree/${id}`),
    async (url, i, { length }) => {
      console.log("// fetch:", url);
      const $ = cheerio.load(await fetch(url));
      console.log("// success!", (i / length) * 100, "%");
      return Number(
        $("#ChildBox > h3 > span.num")
          .text()
          .replace(/（(\d{1,})）/, "$1")
      );
    }
  );
  return games.map((x, i) => ({ ...x, childCount: child[i] }));
})().then(res => {
  // 結果出力
  fs.writeJSONSync(
    `dist/${type}_${limit}_${moment().format("YYYYMMDDHHmmss")}.json`,
    { meta: { type, limit: Number(limit) }, result: res },
    { spaces: 2 }
  );
  console.log(res);
});
