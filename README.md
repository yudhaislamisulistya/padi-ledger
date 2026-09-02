# padi-ledger

Dashboard penelitian **Causal Temporal Graph Transformer (CTGT)** dengan lapisan auditabilitas smart contract untuk traceability proses pascapanen padi.

## Fitur

- Ringkasan dataset dan status proses pascapanen.
- Penelusuran 600 batch berdasarkan artefak CSV penelitian.
- Timeline event dan bukti transaksi blockchain per batch.
- Visualisasi hasil next-event prediction dan anomaly detection.
- Ringkasan lima metrik auditabilitas smart contract.
- Penjelasan arsitektur, manfaat, dan batasan model.

Data pada aplikasi merupakan **dataset sintetis penelitian**, bukan monitoring produksi secara real-time.

## Menjalankan lokal

```bash
npm ci
npm test
npm run dev
```

Aplikasi tersedia di `http://localhost:7113`.

## Menjalankan dengan Docker

```bash
docker compose up -d --build
```

Container dan host menggunakan port `7113`. Pemeriksaan kesehatan tersedia di `/health`.

## Teknologi

- React 19 dan Vite
- Struktur dashboard mengikuti `templates/index.html`
- Sistem desain dari `templates/css`, `templates/fonts`, `templates/images`, dan `templates/js`
- Nginx Alpine untuk produksi
- CSV asli dari eksperimen penelitian
