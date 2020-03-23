# analyze-atsumaru-tree-children

RPG アツマールのコンテンツツリー子作品数をランキングからソートしたい

## なぜ？

- ニコニコ実況が増えるゲームはどんなゲームなのかを調べたい。
- ランキング上位にも関わらず、YouTube 実況が多いゲームとニコニコ実況が多いゲームが混在している。
- ということはランキングに入ってるゲームのコンテンツツリーを調べて集計すれば結果が得られる！

## どうやって？

こうすればコンテンツツリー子作品数が取れる

1. `https://public.api.nicovideo.jp/v1/rpgtkool/ranking.json?_limit=[1-100]&rankingType=[daily|weekly|monthly|total]`
2. `res.data.games[].id` から ID を取得
3. `http://commons.nicovideo.jp/tree/[ID]`
4. `(new DOMParser()).parseFromString(result, "text/html").querySelector("#ChildBox>h3>span.num").innerText.replace(/（(\d{1,})）/,"$1")`

## 使い方

### インストール

```
git clone https://github.com/katai5plate/analyze-atsumaru-tree-children
cd analyze-atsumaru-tree-children
yarn
```

### 実行

```
node . [type] [limit]
```

- type: 取得するランキング
  - `daily`, `weekly`, `monthly`, `total` のどれかを指定する
- limit: 何位まで取得するか
  - 1 ～ 100 の数字を入力する

### 出力結果

`dist/*.json` に JSON ファイルが吐き出されます。
