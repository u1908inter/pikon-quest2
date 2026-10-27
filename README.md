# ピコーン・クエスト2

タップで連撃、戦いの中で技をひらめき、倒した敵を仲間にするドット絵のバトルRPG。
ブラウザで無料・ダウンロード不要で遊べます。

- 紹介ページ: https://u1908inter.github.io/pikon-quest2/
- ゲーム本体: https://u1908inter.github.io/pikon-quest2/pikon-quest2.html
- PLiCy: https://plicy.net/GamePlay/240411

作者: u1908inter

更新履歴は [CHANGELOG.md](CHANGELOG.md)。

## フォルダ構成

| パス | 中身 |
|---|---|
| `index.html` | 紹介ページ（GitHub Pages のトップ） |
| `pikon-quest2.html` | ゲーム本体の入口（軽いHTML。`src/build.py` で生成） |
| `pikon-quest2.js` | ゲームの中身（プログラム・ドット絵・BGM。`src/build.py` で生成） |
| `assets/` | 紹介ページの動画・画像、OGP画像 `og.png`、アイコン |
| `src/js/` | ゲームのソース（読みこむ順番は `build.py` の `MODULES`） |
| `src/shell.html` | HTML の外枠（CSS・metaタグ） |
| `src/sprites.js` | ドット絵データ |
| `src/bgm/` | BGM（64kbps モノラル、約2分ループ） |
| `src/build.py` | ビルドスクリプト |

## ビルド

Python 3 だけで動きます（追加のライブラリは不要）。

```sh
python3 src/build.py
```

- `pikon-quest2.html` + `pikon-quest2.js` … 公開版（Pages 用）。デバッグメニューなし、アクセス解析（GoatCounter）あり。
  HTML を軽くしておかないと、X などにリンクを貼ったときのプレビュー画像（OGP）が読まれないため、中身を JS に分けています。
- `dist/pikon-quest2-single.html` … 公開版の 1ファイル版（配布・保存用）。
- `dist/pikon-quest2-debug.html` … デバッグ版。`dist/` は git に入れません。

ソースを直したら、ビルドしてから `pikon-quest2.html` と `pikon-quest2.js` もいっしょにコミットしてください（Pages はビルドせずにそのまま配信します）。

## GitHub Pages での公開

1. このフォルダの中身を `u1908inter/pikon-quest2` リポジトリに push する。
2. リポジトリの Settings → Pages → Build and deployment で
   Source を「Deploy from a branch」、Branch を `main` / `/ (root)` にして Save。
3. 数分後に https://u1908inter.github.io/pikon-quest2/ で見られる。

ユーザー名やリポジトリ名を変える場合は、次の URL を書きかえてからビルドする。

- `src/build.py` の `SITE`
- `src/js/qol.js` の `SITE_URL`
- `src/shell.html` の `og:url`
- `index.html` の `canonical`・`og:url`・`og:image`・𝕏 シェアリンクの `url=`

## セーブについて

セーブは遊んだブラウザの localStorage（キー `pikon-combo-v1`）に保存されます。
同じ URL で公開し続ければ、更新してもセーブは引き継がれます。公開 URL（ドメインやパス）を変えると別のセーブになるので、ゲーム内の「書き出す」「読みこむ」で移してください。

## 権利

- プログラム・ドット絵・テキスト: © u1908inter
- BGM: AI生成楽曲（非商用利用に限り可）
- フォント: DotGothic16 / M PLUS 1p（SIL Open Font License、Google Fonts から読みこみ）
