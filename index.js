const fs = require("fs-extra");
const cheerio = require("cheerio");
const moment = require("moment");
const fetch = require("./fetch");
const step = require("./step");

const [, , type, limit = 100] = process.argv;

fs.mkdirp("dist");

// 処理開始
(async () => {
  // バリデーション
  const TYPES = ["daily", "weekly", "monthly", "total"];
  if (!TYPES.includes(type)) return `${TYPES.join(" | ")} ?`;
  if (limit < 1 || 100 < limit) return `limit is 1-100`;

  const filename = `dist/${type}_${limit}_${moment().format(
    "YYYYMMDDHHmmss"
  )}.json`;
  const output = (res, status) => {
    fs.writeJSONSync(
      filename,
      { meta: { type, limit: Number(limit), status }, result: res },
      { spaces: 2 }
    );
  };

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
      index,
      childCount: null
    })
  );
  console.log("// success!");

  // 途中結果を出力
  output(games, "working");
  console.log("// create:", filename);

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

  // 結合
  const result = games.map((x, i) => ({ ...x, childCount: child[i] }));

  // 結果出力
  output(result, "done");
  console.log("// update:", filename);

  return result;
})().then(console.log);
