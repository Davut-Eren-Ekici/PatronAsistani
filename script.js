const gunlukAkis = document.querySelector("#gunlukAkis");
const etkinlikFormu = document.querySelector("#etkinlikFormu");

// LocalStorage'dan mevcut verileri al (Yoksa boş dizi ile başla)
let etkinlikler = JSON.parse(localStorage.getItem("etkinlikler")) || [];
let duzenlenenId = null; // Güncelleme modunu takip eder

// 1. Sayfa Açıldığında Saatleri ve Kayıtlı Verileri Çiz
function arayuzCiz() {
    gunlukAkis.innerHTML = "";

    // 24 Saatlik Çizelgeyi Oluştur
    for (let i = 0; i < 24; i++) {
        let saatMetni = String(i).padStart(2, '0') + ":00";
        gunlukAkis.innerHTML += `
            <div class="saat-dilimi" data-saat="${i}">
                <span class="saat-dilimi-label">${saatMetni}</span>
                <div class="etkinlik-container"></div>
            </div>`;
    }

    // Kayıtlı Etkinlikleri Yerleştir
    etkinlikler.forEach(item => {
        const saatIndeksi = parseInt(item.baslangic.split(":")[0]);
        const saatKutusu = document.querySelector(`.saat-dilimi[data-saat="${saatIndeksi}"] .etkinlik-container`);

        if (saatKutusu) {
            const oncelikSinifi = item.oncelik.toLowerCase();
            const tamamlandiClass = item.tamamlandi ? "tamamlandi" : "";

            saatKutusu.innerHTML += `
                <div class="etkinlik-kart ${oncelikSinifi} ${tamamlandiClass}">
                    <div class="kart-sol">
                        <input type="checkbox" ${item.tamamlandi ? "checked" : ""} onchange="durumDegistir(${item.id})">
                        <span class="kart-baslik">${item.baslik}</span>
                        <span class="kart-saat">(${item.baslangic} - ${item.bitis})</span>
                        <span class="kart-durum">Durum: ${item.oncelik}</span>
                    </div>
                    <div class="kart-butonlar">
                        <button class="btn-icon" onclick="düzenleEtkinlik(${item.id})">✏️</button>
                        <button class="btn-icon" onclick="silEtkinlik(${item.id})">🗑️</button>
                    </div>
                </div>
            `;
        }
    });
}

// 2. LocalStorage Güncelleme Yardımcı Fonksiyonu
function kaydetAndYenile() {
    localStorage.setItem("etkinlikler", JSON.stringify(etkinlikler));
    arayuzCiz();
}

// 3. Form Gönderildiğinde (Ekle veya Güncelle)
etkinlikFormu.addEventListener("submit", function (e) {
    e.preventDefault();

    const baslangic = document.getElementById("baslagicSaati").value;
    const bitis = document.getElementById("bitisSaati").value;
    const baslik = document.getElementById("etkinlikBaslik").value;
    const oncelik = document.getElementById("oncelik").value;

    if (duzenlenenId !== null) {
        // Güncelleme Modu
        etkinlikler = etkinlikler.map(item => {
            if (item.id === duzenlenenId) {
                return { ...item, baslangic, bitis, baslik, oncelik };
            }
            return item;
        });
        duzenlenenId = null;
        document.getElementById("eklebtn").innerText = "Plana Ekle";
    } else {
        // Yeni Ekleme Modu
        const yeniEtkinlik = {
            id: Date.now(), // Benzersiz ID
            baslangic,
            bitis,
            baslik,
            oncelik,
            tamamlandi: false
        };
        etkinlikler.push(yeniEtkinlik);
    }

    etkinlikFormu.reset();
    kaydetAndYenile();
});

// 4. Silme İşlemi
function silEtkinlik(id) {
    etkinlikler = etkinlikler.filter(item => item.id !== id);
    kaydetAndYenile();
}

// 5. Tamamlandı (Checkbox) Durumu Değiştirme
function durumDegistir(id) {
    etkinlikler = etkinlikler.map(item => {
        if (item.id === id) {
            return { ...item, tamamlandi: !item.tamamlandi };
        }
        return item;
    });
    kaydetAndYenile();
}

// 6. Düzenleme Moduna Geçiş
function düzenleEtkinlik(id) {
    const hedef = etkinlikler.find(item => item.id === id);
    if (hedef) {
        document.getElementById("baslagicSaati").value = hedef.baslangic;
        document.getElementById("bitisSaati").value = hedef.bitis;
        document.getElementById("etkinlikBaslik").value = hedef.baslik;
        document.getElementById("oncelik").value = hedef.oncelik;

        duzenlenenId = id;
        document.getElementById("eklebtn").innerText = "Güncelle";
    }
}

// Sayfa ilk yüklendiğinde çalıştır
arayuzCiz();