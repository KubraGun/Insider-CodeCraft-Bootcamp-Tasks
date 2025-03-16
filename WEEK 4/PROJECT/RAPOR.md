# PROJE: CODE DEBUGGING
## Giriş
Bu rapor, "Insider JavaScript Bootcamp" için verilen 4. hafta 3. ödev kapsamında yapılan debugging çalışmalarını ve süreç analizini içermektedir. Ödevin amacı, verilen JavaScript kodunu derinlemesine analiz etmek ve çözüm yöntemlerini uygulayarak kodun doğru çalışmasını sağlamaktır.

Debugging süreci boyunca koda uygun düzeyde hata ayıklama teknikleri ve optimizasyon yöntemleri kullanılmıştır. Kullanılan araçlar arasında Chrome DevTools ve Firefox DevTools, Console API, Network Panel ve performans analiz araçları yer almaktadır. Ayrıca kullanıcı deneyimini (UX) etkileyen problemler de tespit edilmiştir.

## Kod İncelemesi
Kodun temel amacı, ileri seviye bir arayüz kullanmadan basit alışveriş sepeti uygulaması oluşturmaktır. Kullanıcıların üürnleri sepete ekleyip çıkarabileceği, toplam fiyatı görüntüleyebileceği ve indirim kodu kullanabileceği sistem hedeflenmiştir.
### Kullanılan ana teknolojiler
Kod Javascript ile yazılmıştır. Temel yapı ile ürünler ve sepetin gösterimi HTML ile sağlanmıştır. CSS kullanılarak temel seviyede stil düzenlemeleri yapılmıştır.
### Kodun genel yapısı
Sınıf yapısı kullanılarak kod oluşturulmuştur. ShoppingCart ve App adında iki temel sınıf (class) bulunmaktadır.
#### ES6 uygunluğu
Fonksiyonlar klasik function yapısıyla değil sınıflar içinde metot olarak tanımlanmıştır. Bu durum modern JavaScript ile gelen class yapısı ile ES6'ya uygundur. Ancak Arrow Function kullanımı tercih edilmemiştir. Özellikle eventListener fonksiyonları için arrow function kullanımı hem bağlamı hem de okunabilirliği kolaylaştırır.

Tüm değişkenler ES6'ya uygun olarak const ve let ile tanımlanmış. Özellikle sabit değerler için const, değişebilecek değerler için let kullanımı doğru tercih olmuş.

Kodda HTML şablonları oluştururken Template Literals (`) kullanılmış. Bu, string interpolasyonunu daha okunabilir hale getirmektedir.

EventListener kullanılmıştır. Özellikle DOMContentLoaded eventi ile dinamik içerikler yüklendikten sonra işlemler yapılmış. Bu, performans ve güvenilirlik açısından olumlu bir tercih.

Kodda try...catch bloklarıyla hata yönetimi sağlanmış. Ancak console.error ile sadece hata loglanmış, daha detaylı hata raporlaması yapılabilir. showError() fonksiyonunda hata mesajları ekrana yazdırılmıştır.

Destructuring ve spread kullanımı görülmemektedir. Kod modüler bir yapıda değildir. Kodda herhangi bir veri saklama (localStorage veya sessionStorage) yapılmamış.

### Kodun işleyiş akışı (Beklenen)
Ürünlerin Listelenmesi: renderProducts() fonksiyonu, ürünleri DOM üzerinde dinamik olarak listeler.

Sepete Ürün Ekleme: addToCart() fonksiyonu ile kullanıcı, sepete ürün ekleyebilir. Bu işlemde stok durumu kontrol edilir.

Sepetten Ürün Çıkarma: removeItem() fonksiyonu, sepetten ürünlerin çıkarılmasını sağlar ve stok güncellenir.

Toplam Tutarın Hesaplanması: calculateTotal() fonksiyonu, sepetteki ürünlerin toplam fiyatını hesaplar.

İndirim Kodu Kullanımı: applyDiscount() fonksiyonu ile geçerli bir indirim kodu kullanılarak toplam tutarda indirim uygulanabilir.

UI Güncellemeleri: updateUI() fonksiyonu, ürünlerin ve toplam fiyatın kullanıcı arayüzünde güncel şekilde görüntülenmesini sağlar.

Hata Yönetimi: showError() ve showMessage() fonksiyonları, kullanıcıya bilgi ve hata mesajları sunar.

Event Yönetimi: DOMContentLoaded ve stockUpdate event'leri dinlenerek kullanıcı deneyimi desteklenmiştir.

### Mevcut Durum Analizi
#### UX Hataları
1- Sepete Eklenen Ürünlerin Fiyat Güncellenmemesi: Sepete aynı ürün defalarca eklendiğinde, ürün adeti doğru şekilde güncelleniyor fakat toplam fiyat güncellenmiyor.

2- İndirim Hata Mesajlarının Kaybolmaması: İndirimi uygula butonuna basıldığında, geçersiz indirim kodu girildiğinde hata mesajı sürekli olarak ekleniyor ve eski mesajlar kaybolmuyor.

3- Stok Güncellemelerinin UI'ye Yansımaması: Ürün kartında stok miktarı güncellenmiyor, bu nedenle stoktan fazla ürün sepete eklenebiliyor.

4- İndirim yanlış uygulanmakta

5- Kodda ürün sepette birden fazla ise sil butonu ile teker teker silme işlemi yapılırken, uygulamada sil butonuna basınca tamamı siliniyor, ancak stok fiyatı artmıyor. 

## Debugging
### Debugging araçlarını hazırlama
Kullanılan tarayıcılarda DevTools açılır. Bu süreçte en sık Console, Sources, Network ve Performance sekmelerine bakacağız.
Console: Hata mesajlarını ve logları görüntüleyeceğiz.
Sources: Breakpoint ekleyerek kodun adım adım nasıl çalıştığını analiz edeceğiz.
Network: API çağrılarını ve yanıt sürelerini gözlemleyeceğiz.
Performance: Kodun hangi bölümlerinin darboğaz oluşturduğunu anlamaya çalışacağız.

### Hataları gözlemlemek (Console)
Console sekmesi aktif hale getirilerek aşağıdaki adımlar gerçekleştirilirek herhangi bir hata mesajı veya beklenmeyen davranış kaydedilir:

    1- Sepete ürün eklemek. 
    
    2- Sepete ürünü ekleyip çıkartmak
    
    3- Stok sınırını aşmak
    
    4- Geçerli ve geçersiz indirim kodlar denemek

#### Ürün stoğu sepete eklendikçe güncellenmiyor
Burada hiçbir olayın tetiklenmesi sonucu bir hata mesajı alınmadı. Bu yüzden kodda kritik yerlere debugger ekleyeceğiz. Tarayıcıda Kaynaklar sekmesine geçip öncelikle addItem() metodunun try-catch bloğunun ilk satırına debugger ekledik. Ardından rastgele ürün seçtik ve sepete ekle dedik. Sepete eklerken ürün seçimi doğru yapılıyordu, ilk ürün seçildiği zaman uiUpdate doğru çalışıyordu. Ancak stok değeri azalmıyordu. Bu yüzden stok kontrolü kontrolü yapılmıyordu. Bunun çözümü için addItem metoduna aşağıdaki kod satırı eklenir:

    product.stock -= quantity;

Ardından tekrar testler yapıldı. Bu test sonucunda stok sayısı 1 olduğunda yetersiz stok uyarısı veriliyor ve buton yetersiz stok durumunda inaktif hale gelmesi gerekirken hala aktif durumda olur ve hata mesajları ekrana yazdırılır. Ayrıca bu hata mesajlarının ekrana yazdırılması da hatalıdır, çünkü her butona basışta, click sayısı kadar hata yan yana sıralanmış durumda olmakta. Öncelikle yetersiz stok uyarısını olması gerektiği gibi alabilmek için addItem metodunda if bloğunun koşulundaki "<=" operatörü yerine sadece "<" mantıksal operatörü kullanıldı. 

    if (product.stock < quantity)
 
Bu düzeltme yapıldıktan sonra, buton kodda stok durumu 0 olduğunda disable olarak ayarlandığı için, butona basılamayacak ve if bloğunun içi hiçbir zaman çalışmayacak. Buna çözüm olarak 2 alternatif belirledim:

1- Buton aktif kalacak ve kullanıcı butona basabilecek, böylelikle if bloğunun içinin çalışması sağlanarak hata mesajı yazdırılacak.

2- Stok 0 olduğu durumunda buton yine disable olacak sadece Stokta Yok! olarak buton yazısı değişecek.

Kodun genel amacının dışına çıkmak istemediğim için 1. çözümü tercih ederk, hata mesajını almayı sağladım. renderProducts metodunu aşağıdaki gibi güncelledim.

    renderProducts() {
        const productsElement = document.getElementById('products');
        if (productsElement) {
            productsElement.innerHTML = products.map(product => `
                <div class="product-card">
                    <h3>${product.name}</h3>
                    <p>Fiyat: ${product.price}.00 TL</p>
                    <p>Stok: ${product.stock > 0 ? product.stock : 'Stokta Yok!'}</p>
                    <button onclick="app.addToCart(${product.id})">
                        Sepete Ekle
                    </button>
                </div>
            `).join('');
        }
    }

#### Hata mesajları üst üste geliyor, belli bir süre sonra kaybolmuyor
Sepet fiyatı güncellemeye geçmeden önce, hata mesajlarının kaybolmayıp yan yana gösterilmesi sorununu halledelim:
addItem fonksiyonuna 3 kontrol noktası için 3 debugger ekleyelim. 


    addItem(productId, quantity = 1) {
        try {
            const product = products.find(p => p.id === productId);
            
            debugger; // 1. kontrol noktası
    
            if (!product) {
                throw new Error('Ürün bulunamadı!');
            }
    
            if (product.stock < quantity) {
                debugger; // 2. kontrol noktası
                throw new Error('Yetersiz stok!');
            }
    
            const existingItem = this.items.find(item => item.productId === productId);
    
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.items.push({
                    productId,
                    name: product.name,
                    price: product.price,
                    quantity
                });
            }
    
            product.stock -= quantity;
            this.calculateTotal();
            this.updateUI();
    
        } catch (error) {
            debugger; // 3. kontrol noktası
            console.error('Ürün ekleme hatası:', error);
            this.showError(error.message);
        }
    }
    
Birinci kontrol noktasında konsolda aşağıdakiler çalışınca doğru sonuçlar elde edildi:
    
    product
    product.stock
    quantity

İkinci kontrol noktasında da konsola product, product.stock, quantity yazılınca sırasıyla ürün, 0 ve 1 sonuçları alındı.Üçüncü kontrol noktasında da error.message doğru bir şekilde geliyor ve this.showError tetikleniyor.

addItem fonksiyonunda hiçbir sorun çıkmadı, sırada showError fonksiyonunda kontrol noktalarıyla hata ayıklama var. bunun için showError fonksiyonuna debugger ekleyelim:

    showError(message) {
        const errorElement = document.getElementById('error');
    
        debugger; // 1. Kontrol noktası -> DOM elementi doğru bulunuyor mu 
    
        if (errorElement) {
            debugger;
            errorElement.textContent += message + '\n'; // 2. kontrol noktası Hata mesajı burada neden birikiyor
        }
    }
 Birinci kontrol noktasında konsolda errorElement yazdığımızda id=error olan element dönüyor.
 
 İkinci kontrol noktasında eski hata mesajları da yer alıyor. Bunun sebebi += kullanılmış olması. Bunu sadece = yazarak düzenledik. Böylelikle hatalar yanyana gözükmüyor. Ancak kodda belirtildiği gibi 3 saniye sonra kaybolmamakta. Bunun için showMessage'daki gibi setTimeout koyalım. Böylelikle bu problem de çözülmüş oldu.
 
 #### Toplam sepet tutarının güncellenmemesi
 Sıradaki problem, toplam bir üründen birden fazla eklendiğinde toplam fiyatın güncellenmiyor olmasıdır. Bunun için calculateTotal() fonksiyonuna debuggerlar ekleyerek kontrol noktaları oluşturalım:

    calculateTotal() {
        debugger; // 1. kontrol noktası -> fonksiyon tetikleniyor mu
    
        this.total = this.items.reduce((sum, item) => {
            debugger; // 2. kontrol noktası Her item için değerler doğru mu
            return sum + item.price; 
    
        if (this.discountApplied && this.total > 0) {
            this.total *= 0.1;
        }
    }

Yukarıda da bir sorun çıkmayınca, bu fonksiyonun çağrıldığı yere kontrol noktası koymaya karar verdim.
addItem fonksiyonunda calculateTotal'den sonra debugger koyarak konsolda cart.items ve calculateTotal yazarak çalıştırdım. cart.items i çağırdığımda ürünler doğru, quantity sayıları da artmış ancak fiyata yansımamış. O zaman sorunun fonksiyondaki hesaplama işleminde olduğu anlaşılır ve hesaplama işlemi aşağıdaki gibi güncellenir:

    return sum + (item.price * item.quantity); // item.quantity ile çarpılır

Bunu ekledik ancak sepette bir ürünün fiyatı * adedi işlemi güncellenmiyor. burada da updateI fonksiyonuna bir debugger koyarak sorunu anladık ki element güncellendikçe aynı çarpım işleminin burada da yapılması gerekiyor. Bu yüzden aşağıdaki gibi kodu güncelledim:

    if (cartElement && totalElement) {
                cartElement.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <span>${item.name}</span>
                        <span>${item.quantity} adet</span>
                        <span>${item.price * item.quantity} TL</span> 
                        <button onclick="cart.removeItem(${item.productId})">Sil</button>
                    </div>
                `).join('');
    }

Böylelikle bu problem de çözülmüş oldu.

#### Silme işlemi
Kodun akışı incelendiğinde, Sil butonunun her click eventinde sepetten 1 azalıp ürün kartında 1 artması gerekiyorken, silme işlemine basıldığında ürün kaç tane eklenmiş olursa olsun sepetten tamamen kaldırılıyor, buna rağmen ürün kartında da herhangi bir güncelleme olmuyor. Bu yüzden removeItem fonksiyonunu debugger ile inceleyelim:

    removeItem(productId) {
        try {
            const itemIndex = this.items.findIndex(item => item.productId === productId);
    
            debugger; // 1. kontrol -> Burada kodu durdurup `itemIndex` değerini kontrol edeceğiz.
    
            if (itemIndex === -1) {
                throw new Error('Ürün sepette bulunamadı!');
            }
    
            const item = this.items[itemIndex];
            const product = products.find(p => p.id === productId);
    
            debugger; // 2. kontrol -> Burada `item` ve `product` verilerini kontrol edeceğiz.
    
            if (product) {
                product.stock += 1;
            }
    
            this.items.splice(itemIndex, 1); // 3. kontrol -> Ürün neden tamamen kaldırılıyor, burada duracağız.
            debugger;
            
            this.calculateTotal(); // Toplam fiyatın doğru güncellenip güncellenmediğini inceleyeceğiz.
            this.updateUI(); // UI güncellemesini kontrol edeceğiz.
    
        } catch (error) {
            console.error('Ürün silme hatası:', error);
            this.showError(error.message);
        }
    }

Birinci kontrol noktasında konsolda itemIndex'i çalıştıralım. Eğer -1 sonuç alırsak ürün sepette bulunamamış demektir, doğru item dönüyorsa bir sonraki kontrol noktasına geçilecek. itemIndex'i konsola girdiğimizde 0 sonucunu aldık, sıradaki adım this.items kontrolünü yapmak. Bunun sonucunda da sepete eklenen ve sil butonuna basılan ürünler doğru bir şekilde listelenmiştir. Bir sonraki adım olan 2. kontrol noktasına geçilir.

İkinci kontrol noktasına gelince item kontrol edilir. item değeri doğru ürünü göstermekte ve quantity de 3 olarak dönmekte. Burada da bir sıkıntı görülmemiştir. Sırada konsolda product kontrolü yapmak. Bu kontrol yapıldığında doğru ürün bulunuyor ve stock değeri doğru. Devamında item.quantity yazıldığında da doğru sonucu göstermektedir. Böylelikle 3. kontrol noktasına geçilir.

Üçüncü kontrol noktasına gelindiğinde item.quantity ve this.items kontrolü yapıldığında, item.quantity hala aynı sonucu gösterirken this.items boş bir dizi dönmekte. Sorunun kaynağı böylelikle belirlenmiş olur. Aşağıdaki satır quantity değerini kontrol etmeden ürünü doğrudan tamamen kaldırıyor:

    this.items.splice(itemIndex, 1);
    
Beklenen davranış ise item.quantity > 1 ise quantity 1 azaltılmalı, sadece quantity === 1 olduğunda ürün tamamen kaldırılmalı. Bunların ardından removeItem fonksiyonu aşağıdaki gibi güncelleniştir:

    removeItem(productId) {
        try {
            const itemIndex = this.items.findIndex(item => item.productId === productId);
    
    
            if (itemIndex === -1) {
                throw new Error('Ürün sepette bulunamadı!');
            }
    
            const item = this.items[itemIndex];
            const product = products.find(p => p.id === productId);
    
            if (item.quantity > 1) {
                item.quantity -= 1; 
            } else {
                this.items.splice(itemIndex, 1); 
            }
    
            if (product) {
                product.stock += 1; 
            }
    
            this.calculateTotal(); 
            this.updateUI();
            document.dispatchEvent(new Event('stockUpdate')); 
    
        } catch (error) {
            console.error('Ürün silme hatası:', error);
            this.showError(error.message);
        }
    }

Değişiklikler test edildiğinde, her kontrol noktasında fonksiyon beklenen davranışı gerçekleştirmiştir.

#### Son problem, indirim
Burada geçerli kod INDIRIM10 olarak belirlenmiş, ancak %90 indirim uygulanmakta. Eğer indirim kodundaki 10 indirim yüzdesini temsil ediyorsa, (indirim total fiyata uygulanıyor) total fiyatı 0.9 ile çarparsak %10 indirimli fiyat elde edilmiş olur.

İndirim kodu yalnızca 1 kere uygulanmakta. Sepete ürün ekleyip/silip güncelleme yapıldığı zaman Geçersiz indirim kodu hatası alınmaktadır. Bunun için applyDiscount fonksiyonuna debugger ekleyelim:

    applyDiscount(code) {
        debugger; // 1. kontrol -> fonksiyon tetikleniyor mu?
    
        if (code === 'INDIRIM10' && !this.discountApplied) {
            this.discountApplied = true;
            
            debugger; // 2. Kontrol -> İndirim doğru uygulanıyor mu
    
            this.calculateTotal();
            this.updateUI();
            this.showMessage('İndirim uygulandı!');
        } else {
            debugger; // 3. kontrol ->  Neden geçersiz hata veriyor (2. ve sonraki tıklamalarda)
            this.showError('Geçersiz indirim kodu!');
        }
    }

Birinci kontrol noktasında fonksiyonun tetiklenip tetiklenmediği kontrol edilir. Fonksiyonun tetiklendiğini kontrol etmek için, parametresi olan code u ekrana yazdırılır. konsol ekranına code yazıldığında, girilen indirim kodu başarıyla görüntülenmiş oldu. Yani fonksiyon tetikleniyor.

İkinci kontrol noktasında, sepete ürünler eklendi ve doğru indirim kodu uygulandı. Öncelikle thisçdiscountApplied kontrol edilir, burada beklenen değer true dur. Konsolda çalıştırıldığında true değerini elde ettik. fonksiyonun parametresi olan code u da konsolda çağırdığımızda doğru sonucu elde ettik. 

İndirim kodu ilk defa uygulandığı için burada hiçbir problem yaşamadık. Ancak sepete varolan ürünlere ürünler ekleyip indirim uygula butonuna tıkladığımızda, ilk kontrol noktasına takıldı. Çünkü ilk defa tıklandığında this.discountApplied true olarak kalıyor ve koşulun içine giremiyoruz. İlk tıklamadan önce this.discountApplied false değerine sahipti o yüzden indirim rahatlıkla uygulanıyordu. Bunun çözümü olarak da addItem ve removeItem fonksiyonlarına aşağıdaki kodu ekleyerek güncelleyeceğiz.

    this.discountApplied = false;
    
## Sonuç
Bu raporda, Insider Bootcamp kapsamında verilen proje üzerinde kapsamlı bir debugging süreci gerçekleştirilmiş ve proje içerisindeki temel hatalar adım adım tespit edilerek çözüme kavuşturulmuştur.

### Başarıyla Çözülen Sorunlar

Stok Güncellenmeme Sorunu:

Sepete ürün eklendiğinde veya silindiğinde, ürün kartındaki stok bilgisi doğru şekilde güncellenmiyordu.
Sorun, stockUpdate eventi kullanılarak ve product.stock değerinin doğru güncellenmesiyle çözülmüştür.
Hata Mesajlarının Kaybolmaması ve Üst Üste Birikmesi:

Hata mesajları, kullanıcıya daha okunabilir ve anlaşılır şekilde sunulacak şekilde showError fonksiyonu güncellenmiştir.
Hata mesajları 3 saniye sonra otomatik olarak temizlenecek şekilde düzenlenmiştir.
Toplam Fiyatın Yanlış Hesaplanması:

calculateTotal fonksiyonunda, ürünlerin quantity değerleri dikkate alınmıyordu.
Fonksiyon, ürün fiyatlarının quantity ile çarpılması sağlanarak doğru şekilde düzenlenmiştir.
Silme İşleminde Ürünlerin Yanlış Kaldırılması:

removeItem fonksiyonunda, quantity değeri dikkate alınmadan ürünler tamamen kaldırılıyordu.
Bu sorun, quantity > 1 ise yalnızca miktarın azaltılması, quantity === 1 olduğunda ise ürünün tamamen kaldırılmasıyla çözülmüştür.
İndirim Kodunun Tekrar Uygulanamaması:

İndirim kodu yalnızca bir kez uygulanabiliyor, ürün ekleme/silme işlemi sonrasında tekrar uygulanmak istendiğinde "Geçersiz indirim kodu!" hatası alınıyordu.
Sorun, discountApplied değerinin ürün ekleme/silme işlemi sonrasında otomatik olarak false yapılmasıyla çözülmüştür.
Böylece kullanıcı, ürün güncellemelerinden sonra tekrar indirim kodunu uygulayabilir hale gelmiştir.

Debugging Sürecinde Kullanılan Yöntemler

debugger ve Chrome DevTools: Kodun kritik noktalarında debugger kullanılarak, adım adım değerler analiz edilmiştir.

Console API: console.log ve console.error kullanılarak değerlerin izlenmesi sağlanmıştır.
Koşullu Kontroller: Hataların neden oluştuğu, if blokları kullanılarak belirlenmiş ve gerektiği yerlerde hata mesajları güncellenmiştir.

Genel Değerlendirme
Bu debugging süreci sayesinde proje içerisinde bulunan tüm temel hatalar başarılı bir şekilde tespit edilmiş ve çözülmüştür. Kodun işleyişi daha temiz, doğru ve kullanıcı dostu hale getirilmiştir. Kullanıcı deneyimi artırılmış, hata mesajları daha okunabilir ve anlaşılır şekilde sunulmuş ve toplam fiyat hesaplamaları netleştirilmiştir.


