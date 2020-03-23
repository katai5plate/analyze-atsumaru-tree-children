# analyze-atsumaru-tree-children

RPG アツマールのコンテンツツリー子作品数をランキングからソートしたい

## なぜ？

- ニコニコ実況が増えるゲームはどんなゲームなのかを調べたい。
- ランキング上位にも関わらず、YouTube 実況が多いゲームとニコニコ実況が多いゲームが混在している。
- ということはランキングに入ってるゲームのコンテンツツリーを調べて集計すれば結果が得られるはず！

## 使い方

### インストール

```
git clone https://github.com/katai5plate/analyze-atsumaru-tree-children
cd analyze-atsumaru-tree-children
yarn
```

### スクリプト

### ランキング集計

```
yarn start [type] [limit]
```

- type: 取得するランキング
  - `daily`, `weekly`, `monthly`, `total` のどれかを指定する
- limit: 何位まで取得するか
  - 1 ～ 100 の数字を入力する
- 100 位まで取得する場合 10 分ぐらいかかります。

### dist ディレクトリ全消し

```
yarn cls
```

- 引数指定なし

### 出力結果

`dist` ディレクトリに JSON ファイルが吐き出されます。
