# Oyun Varlıkları (Assets)

Bu klasör karakter sprite'larını, ses dosyalarını ve diğer oyun varlıklarını barındırır.

---

## Sprite Değiştirme

Oyun şu an programatik olarak oluşturulmuş yertutucu (placeholder) görseller kullanmaktadır.
Kendi karakter görsellerin hazır olduğunda aşağıdaki adımları izle:

### Karakter Sprite Sheet (Oyuncu)

**`images/player.png`** — Aşağıdaki animasyon karelerini içeren bir sprite sheet:

| Kare # | Animasyon  | Açıklama         |
|--------|------------|------------------|
| 0–3    | idle       | Beklerken (4 kare) |
| 4–9    | run        | Koşarken (6 kare) |
| 10     | jump       | Zıplamada (1 kare) |
| 11     | hurt       | Hasar alırken    |

Örnek kullanım `BootScene.js`'de:
```javascript
// Yertutucu yerine sprite sheet yükle:
this.load.spritesheet('player', 'assets/images/player.png', {
  frameWidth: 32,
  frameHeight: 48,
});
```

### Düşman Sprite Sheet

**`images/enemy.png`** — En az 2 kare (yürüme, ezilme)

### Müzik ve Ses Efektleri

Ses dosyaları `audio/` klasörüne konulmalıdır:

| Anahtar        | Dosya                 | Açıklama            |
|----------------|-----------------------|---------------------|
| `bgMusic`      | `audio/bg_music.mp3`  | Arka plan müziği    |
| `sfx_jump`     | `audio/jump.mp3`      | Zıplama sesi        |
| `sfx_coin`     | `audio/coin.mp3`      | Para toplama        |
| `sfx_stomp`    | `audio/stomp.mp3`     | Düşmanı ezme        |
| `sfx_hurt`     | `audio/hurt.mp3`      | Hasar alma          |
| `sfx_correct`  | `audio/correct.mp3`   | Doğru cevap         |
| `sfx_wrong`    | `audio/wrong.mp3`     | Yanlış cevap        |
| `sfx_box`      | `audio/box_open.mp3`  | Sandık açılması     |
| `sfx_select`   | `audio/select.mp3`    | Menü seçimi         |
| `sfx_shield`   | `audio/shield.mp3`    | Kalkan aktivasyonu  |
| `sfx_complete` | `audio/complete.mp3`  | Bölüm tamamlandı    |

Ses dosyalarını `BootScene.js`'e ekle:
```javascript
// create() metodunun içine:
this.load.audio('bgMusic',  'assets/audio/bg_music.mp3');
this.load.audio('sfx_jump', 'assets/audio/jump.mp3');
// ... diğerleri
```

---

## Yeni Bölüm Ekleme

`js/levels/levels.js` dosyasına yeni bir obje eklemek yeterli:

```javascript
{
  id: 4,
  name: 'Volkan Adası',
  width: 7000,
  bgTop: 0x8B0000,
  bgBot: 0xFF4500,
  mathDifficulty: 3,
  platforms: [ ... ],
  boxes:     [ ... ],
  enemies:   [ ... ],
  coins:     [ ... ],
  goalX: 6900,
}
```

## Yeni Soru Tipi Ekleme

`js/utils/QuestionGenerator.js` → `generate()` metoduna yeni bir `if` dalı ekle.
Örnek: çarpma soruları için `isMult = Math.random() < 0.33` gibi bir kontrol eklenebilir.
