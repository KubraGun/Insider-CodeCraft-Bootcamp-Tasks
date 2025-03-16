# User List App Test 

## Sayfayı yeniden yükleme
• Beklenen sonuç:
MutationObserver started
New user card added: [object HTMLDivElement]

• Alınan sonuç:
MutationObserver started

## Bir kullanıcıyı sil ✅
• Beklenen sonuç:
Removed a user card: [object HTMLDivElement]

• Alınan sonuç:
Removed a user card: <div class=​"user-card" style=​"background:​ linear-gradient(135deg, white, rgb(235, 233, 225)​)​;​ border-radius:​ 12px;​ padding:​ 20px;​ box-shadow:​ rgba(0, 0, 0, 0.15)​ 0px 8px 16px;​ transition:​ transform 0.3s, box-shadow 0.3s;​ position:​ relative;​ overflow:​ hidden;​ transform:​ translateY(-5px)​;​" data-user-id=​"4">​…​</div>​


## Son kullanıcıyı silme ✅
• Beklenen sonuç:
Reload button added

• Alınan sonuç:
Reload button added

## Reload butonuna tıklama
• Beklenen sonuç:
Reload button clicked
MutationObserver started
New user card added: [object HTMLDivElement]

• Alınan sonuç:
Reload button clicked 
User data loaded successfully with fetch.

1. çözüm için
    observeMutations'u handle reload içerisinde de çağırmak (2. kez)

• Alınan sonuç:
Reload button clicked
MutationObserver started
User data loaded successfully with fetch.

## Sayfa ilk yüklendiğinde localStorage kontrolü ✅
app_users verisi düzgün bir şekilde kullanıcı bilgilerini içeriyor.
app_users_expiration tarihi de doğru şekilde ayarlanmış.

Sorun:
- localStorage'dan veriler başarıyla çekiliyor
- renderUsers ile userCard'lar ekleniyor ancak MutationObserver reload işleminde DOM'a eklenen userCard'ları görmüyor. 

## Hatalı API durumu ✅
Bunun için kod üzerinde istek yaptığımız URL'yi şu şekilde değiştirelim:
const response = await fetch(`https://jsonplaceholder.typicode.com/uıuo`);

Failed to load user data with fetch:  Error: HTTP Error! Status: 404

## Reload butonuna tıklamadan önce sessionStorage
• Beklenen Sonuç: sessionStorage'da reload_button_used anahtarının olmaması.
null

• Alınan Sonuç: 
IsThisFirstTime_Log_From_LiveServer : true

Şu an yalnızca 1 tane anahtar var. reload_button_used henüz oluşmamış. ✅

## Reload butonuna tıkladıktan sonra sessionStorage ✅
• Beklenen Sonuç:
reload_button_used : true

• Alınan Sonuç: 
IsThisFirstTime_Log_From_LiveServer : true
reload_button_used : true


## Sayfa yeniledikten sonra sessionStorage ✅
• Beklenen Sonuç: 
reload_button_used : true

• Alınan Sonuç: 
IsThisFirstTime_Log_From_LiveServer : true

reload_button_used anahtarı sayfa yenilenince olmuyor.
Çözüm:
$(document).ready(() => {
    sessionStorage.removeItem(STORAGE_KEYS.RELOAD_USED);

    initApp();
});

Burada $(document).ready() tetiklendiğinde sessionStorage'daki reload_button_used anahtarı manuel olarak siliniyor. Sayfa ilk kez yükleniyorsa temizlensin. Kodu aşağıdaki gibi güncelleyelim:
$(document).ready(() => {
    if (!sessionStorage.getItem(STORAGE_KEYS.RELOAD_USED)) {
        sessionStorage.removeItem(STORAGE_KEYS.RELOAD_USED);
    }

    initApp();
});
 
Sorun çözüldü ✅

## Sayfayı kapatıp yeniden açtıktan sonra sessionStorage
• Beklenen Sonuç:
null

• Alınan Sonuç:
null


## sessionStorage için otomatik test fonksiyonu
const testSessionStorage = () => {
    const value = sessionStorage.getItem('reload_button_used');
    
    if (!value) {
        console.log('✅ Test 1: Reload button has not been used yet.');
    } else if (value === 'true') {
        console.log('✅ Test 2: Reload button has been used and sessionStorage is working.');
    } else {
        console.error('❌ Test Failed: Unexpected sessionStorage value:', value);
    }
};

Tıklamadan ve tıkladıktan sonra çalıştır:

testSessionStorage();

Sonuç: Başarılı ✅