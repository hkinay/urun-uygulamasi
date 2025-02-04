document.getElementById('urunForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const urun = {
        barkod: document.getElementById('barkod').value,
        urun_adi: document.getElementById('urun_adi').value,
        fiyat: parseFloat(document.getElementById('fiyat').value),
        vergi_orani: parseFloat(document.getElementById('vergi_orani').value),
        tedarikci: document.getElementById('tedarikci').value
    };

    try {
        const response = await fetch('/urun-ekle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(urun)
        });
        if (!response.ok){
            const errorData = await response.json();
            if(errorData.error.type === 'validation' && errorData.error.field ==='barkod'){
                alert('Bu barkod numarası zaten kullanılıyor. Lütfen farklı bir barkod numarası girin.');
                document.getElementById('barkod').focus(); // Barkod alanına odaklan
            }else{
                alert(errorData.error.message || 'Ürün eklenirken bir hata oluştu');
            }
            return;
        }

        const data = await response.text();
        alert(data.message);

        // Ürün eklendikten sonra listeyi güncelle
        urunleriListele();
        document.getElementById('urunForm').reset();
        
    } catch (error) {
        console.error('Hata:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.'); // Genel bir hata mesajı göster

    }
});


const urunAdiArama = document.getElementById('urunAdiArama');
const urunTablosu = document.getElementById('urunTablosu').getElementsByTagName('tbody')[0];


urunAdiArama.addEventListener('input', () => {
  const aramaTerimi = urunAdiArama.value.toLowerCase();
  urunleriListele(aramaTerimi);

  // Tabloyu temizle
  urunTablosu.innerHTML = '';

  urunler.forEach(urun => {
    if (urun.urun_adi.toLowerCase().includes(aramaTerimi)) {
      const satir = urunTablosu.insertRow();
      const hucreBarkod = satir.insertCell();
      const hucreUrunAdi = satir.insertCell();
      const hucreFiyat = satir.insertCell();
      const hucreVergiOrani = satir.insertCell();
      const hucreVergiDahilFiyat = satir.insertCell();
      const hucreTedarikci = satir.insertCell();

      hucreBarkod.textContent = urun.barkod;
      hucreUrunAdi.textContent = urun.urun_adi;
      hucreFiyat.textContent = urun.fiyat;
      hucreVergiOrani.textContent = urun.vergi_orani;
      hucreVergiDahilFiyat.textContent = urun.vergi_dahil_fiyat;
      hucreTedarikci.textContent = urun.tedarikci;
    }
  });
});



// Ürünleri listeleme fonksiyonu
async function urunleriListele(aramaTerimi = '') {
   
    const urunTablosu = document.getElementById('urunTablosu').getElementsByTagName('tbody')[0];
    let urunler = [];

    try {
        const response = await fetch('/urunler');
      if(!response.ok){
        throw new Error('HTTP error! status:${response.status}');
      }
urunler = await response.json();
        // Önce listeyi ve tabloyu temizle
    
        urunTablosu.innerHTML = '';

        urunler.forEach(urun => {
            
            if (aramaTerimi === '' || urun.urun_adi.toLowerCase().includes(aramaTerimi.toLowerCase()))
            // Tablo için satır oluştur
            {const satir = urunTablosu.insertRow();
            const hucreBarkod = satir.insertCell();
            const hucreUrunAdi = satir.insertCell();
            const hucreFiyat = satir.insertCell();
            const hucreVergiOrani = satir.insertCell();
            const hucreVergiDahilFiyat = satir.insertCell();
            const hucreTedarikci = satir.insertCell();

            hucreBarkod.textContent = urun.barkod;
            hucreUrunAdi.textContent = urun.urun_adi;
            hucreFiyat.textContent = urun.fiyat;
            hucreVergiOrani.textContent = urun.vergi_orani;
            hucreVergiDahilFiyat.textContent = urun.vergi_dahil_fiyat;
            hucreTedarikci.textContent = urun.tedarikci;}
        });
    } catch (error) {
        console.error('Ürünleri alma hatası:', error);
        if (error.message === 'Bu barkod numarasına sahip bir ürün zaten kayıtlı.') {
            alert('Bu barkod numarası zaten kullanılıyor. Lütfen farklı bir barkod numarası girin.');
        } else {
            alert('Ürün eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    urunleriListele();
});