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

  const FILENAME = `dist/${type}_${limit}_${moment().format(
    "YYYYMMDDHHmmss"
  )}.json`;

  const API_RANKING = `https://public.api.nicovideo.jp/v1/rpgtkool/ranking.json?_limit=${limit}&rankingType=${type}`;
  const API_ADS =
    "https://api.nicoad.nicovideo.jp/v1/contents/atsumaru/decoration?ids=";

  const output = (res, status) => {
    fs.writeJSONSync(
      FILENAME,
      { meta: { type, limit: Number(limit), status }, result: res },
      { spaces: 2 }
    );
  };
  const temp = res => {
    fs.appendFileSync("dist/temp.txt", res + "\n");
  };
  const deleteTemp = reset => {
    fs.removeSync("dist/temp.txt");
    if (reset) fs.writeFileSync("dist/temp.txt", "");
  };

  deleteTemp(true);

  // アツマールランキング API から目ぼしいデータだけ取り出す
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

  // ニコニ広告を取得
  const adUrl = API_ADS + games.map(x => x.id).join(",");
  console.log("// fetch:", adUrl);
  const ads = (await fetch(adUrl)).data.contents.reduce(
    (p, { id, ...rest }) => ({ ...p, [id]: { ...rest } }),
    {}
  );
  console.log("// success!");

  // 結合
  const gamesWithAd = games.map((x, i) => ({
    ...x,
    activePoint: ads[x.id].activePoint,
    totalPoint: ads[x.id].totalPoint
  }));

  // 途中結果を出力
  output(gamesWithAd, "working");
  console.log("// create:", FILENAME);

  // コンテンツツリーページから子作品数を取り出す
  const child = await step(gamesWithAd, async ({ id }, i, { length }) => {
    const url = `http://commons.nicovideo.jp/tree/${id}`;
    console.log("// fetch:", url);
    const $ = cheerio.load(await fetch(url));
    console.log("// success!", (i / length) * 100, "%");
    const value = Number(
      $("#ChildBox > h3 > span.num")
        .text()
        .replace(/（(\d{1,})）/, "$1")
    );
    temp(`${JSON.stringify({ id, childCount: value })},`);
    return value;
  });

  // 結合
  const result = gamesWithAd.map((x, i) => ({ ...x, childCount: child[i] }));

  // 結果出力
  output(result, "done");
  deleteTemp(false);
  console.log("// update:", FILENAME);

  return result;
})().then(console.log);
