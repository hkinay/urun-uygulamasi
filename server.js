const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'urun_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL bağlantısı başarılı...');
});

// Hata yönetimi için fonksiyon
function handleDatabaseError(res, err, message) {
    console.error('Veritabanı hatası:', err);
    res.status(500).json({ error: { type: 'database', message: message, details: err.message } });
}

app.post('/urun-ekle', (req, res) => {
    const { barkod, urun_adi, fiyat, vergi_orani, tedarikci } = req.body;
    const vergi_dahil_fiyat = parseFloat(fiyat) * (1 + parseFloat(vergi_orani) / 100);

    db.query('SELECT * FROM urunler WHERE barkod = ?', [barkod], (err, results) => {
        if (err) {
            return handleDatabaseError(res, err, 'Barkod kontrolü sırasında bir hata oluştu.');
        }

        if (results.length > 0) {
            return res.status(400).json({ error: { 
              type: 'validation', 
              message: 'Bu barkod numarasına sahip bir ürün zaten kayıtlı.',
            field:'barkod' } 
          });
        }

        const sql = 'INSERT INTO urunler (barkod, urun_adi, fiyat, vergi_orani, vergi_dahil_fiyat, tedarikci) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [barkod, urun_adi, fiyat, vergi_orani, vergi_dahil_fiyat, tedarikci], (err, result) => {
            if (err) {
                return handleDatabaseError(res, err, 'Ürün eklenirken bir hata oluştu.');
            }
            res.status(201).json({ message: `${urun_adi} başarıyla eklendi.`, urun_id: result.insertId });
        });
    });
});

app.get('/urunler', (req, res) => {
    const sql = 'SELECT * FROM urunler';
    db.query(sql, (err, results) => {
        if (err) {
            return handleDatabaseError(res, err, 'Ürünler alınırken bir hata oluştu.');
        }
        res.json(results);
    });
});

app.put('/urun-guncelle/:barkod', (req, res) => {
  const barkod = req.params.barkod;
  const { urun_adi, fiyat, vergi_orani, tedarikci } = req.body;
  const vergi_dahil_fiyat = parseFloat(fiyat) * (1 + parseFloat(vergi_orani) / 100);

  const sql = `UPDATE urunler SET urun_adi = ?, fiyat = ?, vergi_orani = ?, vergi_dahil_fiyat = ?, tedarikci = ? WHERE barkod = ?`;
  db.query(sql, [urun_adi, fiyat, vergi_orani, vergi_dahil_fiyat, tedarikci, barkod], (err, result) => {
    if (err) {
      return handleDatabaseError(res, err, 'Ürün güncellenirken bir hata oluştu.');
    }
    res.json({ message: 'Ürün başarıyla güncellendi.' });
  });
});
app.listen(5000, () => {
    console.log('Sunucu http://localhost:5000 adresinde çalışıyor...');
});