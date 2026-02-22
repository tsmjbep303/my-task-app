# experiments（試作・比較用）

本番の `index.html` と比べたいバージョンや、試しに作ったものを置くフォルダです。

## フォルダ構成

```
experiments/
├── README.md           ← このファイル
├── preconnect/         … 表示・読み込みの比較
│   └── index.html      （preconnect なし版）
├── broken-href/        … パスをわざと壊した実験
│   └── index.html      （CSS/JS の href を壊した版）
└── break/              … 「1要素だけ抜く」実験（各行の役割を掴む）
    ├── README.md
    ├── no-append.html 〜 no-empty-check.html（8種類）
    └── js/
        └── app-no-○○.js（8種類）
```

## 各フォルダの説明

- **preconnect/** … Google Fonts の preconnect を付けない版。表示速度の比較用。
- **broken-href/** … CSS/JS のパスをわざと間違えた版。読み込みに失敗する様子の確認用。
- **break/** … 本番の `app.js` から重要な1行（または数行）だけコメントアウトした版。  
  開くHTMLで「どの処理が何をしているか」を観察できます。くわしくは `break/README.md` を参照。
