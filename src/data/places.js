const BASE_PLACES = [
  // İZMİR
  { id: 'izm-1', name: 'Kadifekale', city: 'İzmir', category: 'tarihi', latitude: 38.404, longitude: 27.137, rating: 4.3, reviewCount: 18500, description: 'Helenistik dönemden kalma antik kale. İzmir manzarasına hakimdir.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Kadifekale_izmir.jpg/640px-Kadifekale_izmir.jpg' },
  { id: 'izm-2', name: 'İzmir Arkeoloji Müzesi', city: 'İzmir', category: 'muze', latitude: 38.417, longitude: 27.132, rating: 4.5, reviewCount: 7200, description: 'Efes ve Bergama\'dan gelen antik eserler.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Izmir_Archaeology_Museum.jpg/640px-Izmir_Archaeology_Museum.jpg' },
  { id: 'izm-3', name: 'Atatürk Müzesi (İzmir)', city: 'İzmir', category: 'unlu_kisi', latitude: 38.438, longitude: 27.143, rating: 4.6, reviewCount: 9100, description: 'Atatürk\'ün İzmir\'deki müze-evi.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Ataturk_museum_izmir.jpg/640px-Ataturk_museum_izmir.jpg' },
  { id: 'izm-4', name: 'Konak Saat Kulesi', city: 'İzmir', category: 'tarihi', latitude: 38.4189, longitude: 27.1287, rating: 4.2, reviewCount: 26000, description: '1901\'de inşa edilen İzmir\'in sembolü.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Konak_clock_tower_Izmir_Turkey.jpg/480px-Konak_clock_tower_Izmir_Turkey.jpg' },
  { id: 'izm-5', name: 'Deniz Restaurant', city: 'İzmir', category: 'restoran', latitude: 38.439, longitude: 27.142, rating: 4.4, reviewCount: 3100, description: 'Deniz ürünleri ve meze çeşitleriyle bilinen köklü restoran.', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70' },
  { id: 'izm-6', name: 'Efes Antik Kenti', city: 'İzmir (Selçuk)', category: 'tarihi', latitude: 37.939, longitude: 27.341, rating: 4.8, reviewCount: 85000, description: 'Dünyanın en iyi korunmuş antik kentlerinden biri.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Library_of_Celsus_in_Ephesus.jpg/640px-Library_of_Celsus_in_Ephesus.jpg' },
  { id: 'izm-7', name: 'Çeşme Altınkum Plajı', city: 'İzmir (Çeşme)', category: 'doga', latitude: 38.323, longitude: 26.302, rating: 4.6, reviewCount: 12000, description: 'Kristal berraklığında suyu ve altın sarısı kumuyla Ege\'nin en güzel plajlarından biri.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Cesme_Altinkum_Beach.jpg/640px-Cesme_Altinkum_Beach.jpg' },
  { id: 'izm-8', name: 'Alaçatı Plajı', city: 'İzmir (Alaçatı)', category: 'doga', latitude: 38.277, longitude: 26.373, rating: 4.5, reviewCount: 18500, description: 'Sörf ve rüzgar sörfüyle ünlü turkuaz suları olan popüler plaj.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Alacati_beach.jpg/640px-Alacati_beach.jpg' },
  { id: 'izm-9', name: 'Buca Baraj Piknik Alanı', city: 'İzmir', category: 'doga', latitude: 38.381, longitude: 27.185, rating: 4.2, reviewCount: 3400, description: 'Şehre yakın ağaçlık gölgeli piknik masaları ve mangal alanları.', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=70' },

  // MANİSA
  { id: 'man-1', name: 'Manisa Müzesi', city: 'Manisa', category: 'muze', latitude: 38.614, longitude: 27.425, rating: 4.1, reviewCount: 850, description: 'Bölgedeki antik kentlerden gelen eserler.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Manisa_Museum.jpg/640px-Manisa_Museum.jpg' },
  { id: 'man-2', name: 'Niobe (Ağlayan Kaya)', city: 'Manisa', category: 'tarihi', latitude: 38.635, longitude: 27.45, rating: 4.0, reviewCount: 610, description: 'Spil Dağı yamacında antik mitolojiye dayanan kaya oluşumu.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Niobe_rock_Manisa.jpg/640px-Niobe_rock_Manisa.jpg' },
  { id: 'man-3', name: 'Spil Dağı Milli Parkı', city: 'Manisa', category: 'doga', latitude: 38.65, longitude: 27.5, rating: 4.5, reviewCount: 3200, description: 'Yürüyüş parkurları ve piknik alanlarıyla dolu milli park.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Spil_mountain.jpg/640px-Spil_mountain.jpg' },

  // AFYONKARAHİSAR
  { id: 'afy-1', name: 'Afyonkarahisar Kalesi', city: 'Afyonkarahisar', category: 'tarihi', latitude: 38.756, longitude: 30.54, rating: 4.3, reviewCount: 1450, description: 'Şehre adını veren tarihi kale kalıntısı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Afyon_Kocatepe.jpg/640px-Afyon_Kocatepe.jpg' },
  { id: 'afy-2', name: 'Kocatepe (Başkomutanlık)', city: 'Afyonkarahisar', category: 'tarihi', latitude: 38.63, longitude: 30.09, rating: 4.6, reviewCount: 1980, description: 'Büyük Taarruz\'un planlandığı yer. Kurtuluş Savaşı\'nın kalbi.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Kocatepe_Afyon.jpg/640px-Kocatepe_Afyon.jpg' },
  { id: 'afy-3', name: 'Afyon Sucuk Evi', city: 'Afyonkarahisar', category: 'restoran', latitude: 38.756, longitude: 30.535, rating: 4.5, reviewCount: 1320, description: 'Afyon sucuğu ve kaymaklı tatlılar.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=70' },
  { id: 'afy-4', name: 'Frigya Vadisi', city: 'Afyonkarahisar', category: 'doga', latitude: 38.65, longitude: 30.02, rating: 4.7, reviewCount: 2800, description: 'Kaya oyma tapınakları ve doğal mağaralarıyla büyüleyici vadi.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Phrygia_valley_Turkey.jpg/640px-Phrygia_valley_Turkey.jpg' },

  // ESKİŞEHİR
  { id: 'esk-1', name: 'Odunpazarı Tarihi Evleri', city: 'Eskişehir', category: 'tarihi', latitude: 39.765, longitude: 30.53, rating: 4.6, reviewCount: 5400, description: 'Osmanlı dönemi sivil mimarisini yansıtan tarihi mahalle.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Odunpazari_Eskisehir.jpg/640px-Odunpazari_Eskisehir.jpg' },
  { id: 'esk-2', name: 'Eskişehir Çini Müzesi', city: 'Eskişehir', category: 'muze', latitude: 39.77, longitude: 30.525, rating: 4.3, reviewCount: 640, description: 'Geleneksel Türk çini sanatı eserleri.', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=400&q=70' },
  { id: 'esk-3', name: 'Sazova Parkı', city: 'Eskişehir', category: 'doga', latitude: 39.798, longitude: 30.487, rating: 4.7, reviewCount: 12000, description: 'Dev piknik ve eğlence parkı, şehrin en büyük yeşil alanı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Sazova_park_eskisehir.jpg/640px-Sazova_park_eskisehir.jpg' },

  // ANKARA
  { id: 'ank-1', name: 'Anıtkabir', city: 'Ankara', category: 'unlu_kisi', latitude: 39.9255, longitude: 32.8378, rating: 4.9, reviewCount: 102000, description: 'Mustafa Kemal Atatürk\'ün anıt mezarı ve müze kompleksi.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Anitkabir_2.jpg/640px-Anitkabir_2.jpg' },
  { id: 'ank-2', name: 'Anadolu Medeniyetleri Müzesi', city: 'Ankara', category: 'muze', latitude: 39.9398, longitude: 32.8617, rating: 4.8, reviewCount: 24500, description: 'Anadolu medeniyetlerini anlatan ödüllü müze.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Museum_of_Anatolian_Civilizations.jpg/640px-Museum_of_Anatolian_Civilizations.jpg' },
  { id: 'ank-3', name: 'Ankara Kalesi', city: 'Ankara', category: 'tarihi', latitude: 39.9417, longitude: 32.8627, rating: 4.4, reviewCount: 15800, description: 'Şehre tepeden bakan tarihi kale.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Ankara_Castle.jpg/640px-Ankara_Castle.jpg' },
  { id: 'ank-4', name: 'Hamamönü Konağı', city: 'Ankara', category: 'restoran', latitude: 39.942, longitude: 32.865, rating: 4.4, reviewCount: 4100, description: 'Osmanlı konağında yöresel mutfak.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Hamamonu_ankara.jpg/640px-Hamamonu_ankara.jpg' },
  { id: 'ank-5', name: 'Eymir Gölü', city: 'Ankara', category: 'doga', latitude: 39.85, longitude: 32.77, rating: 4.6, reviewCount: 18000, description: 'Yürüyüş parkuru ve piknik alanlarıyla çevrili doğal göl.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Lake_Eymir.jpg/640px-Lake_Eymir.jpg' },

  // ÇANAKKALE
  { id: 'can-1', name: 'Gelibolu Tarihi Milli Parkı', city: 'Çanakkale', category: 'tarihi', latitude: 40.228, longitude: 26.358, rating: 4.9, reviewCount: 45000, description: 'Çanakkale Savaşları\'nın yaşandığı kutsal topraklar.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Chunuk_Bair_Memorial.jpg/640px-Chunuk_Bair_Memorial.jpg' },
  { id: 'can-2', name: 'Troia Antik Kenti', city: 'Çanakkale', category: 'tarihi', latitude: 39.957, longitude: 26.238, rating: 4.5, reviewCount: 22000, description: 'Homeros\'un İlyada destanına konu olan efsanevi şehir.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Troy-wooden-horse.jpg/640px-Troy-wooden-horse.jpg' },

  // KAPADOKYA
  { id: 'kap-1', name: 'Göreme Açık Hava Müzesi', city: 'Nevşehir', category: 'muze', latitude: 38.643, longitude: 34.831, rating: 4.8, reviewCount: 55000, description: 'Kaya kiliseler ve fresklerle dolu UNESCO alanı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Goreme_open_air_museum.jpg/640px-Goreme_open_air_museum.jpg' },
  { id: 'kap-2', name: 'Ihlara Vadisi', city: 'Aksaray', category: 'doga', latitude: 38.253, longitude: 34.093, rating: 4.8, reviewCount: 18000, description: 'Melendiz Çayı boyunca uzanan muhteşem kanyon yürüyüş güzergahı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Ihlara_Valley.jpg/640px-Ihlara_Valley.jpg' },

  // TRABZON
  { id: 'tra-1', name: 'Sümela Manastırı', city: 'Trabzon', category: 'tarihi', latitude: 40.693, longitude: 39.658, rating: 4.9, reviewCount: 42000, description: 'Kayalıklara oyulmuş eşsiz Rum Ortodoks manastırı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Sumela_monastery.jpg/640px-Sumela_monastery.jpg' },
  { id: 'tra-2', name: 'Uzungöl', city: 'Trabzon', category: 'doga', latitude: 40.621, longitude: 40.283, rating: 4.7, reviewCount: 38000, description: 'Yeşil dağlarla çevrili büyüleyici doğal göl.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Uzungol_lake.jpg/640px-Uzungol_lake.jpg' },

  // ANTALYA
  { id: 'ant-1', name: 'Termessos Antik Kenti', city: 'Antalya', category: 'tarihi', latitude: 37.067, longitude: 30.478, rating: 4.8, reviewCount: 15000, description: 'Toros Dağları\'nda İskender\'in bile alamadığı antik kent.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Termessos_theatre.jpg/640px-Termessos_theatre.jpg' },
  { id: 'ant-2', name: 'Düden Şelalesi', city: 'Antalya', category: 'doga', latitude: 36.906, longitude: 30.755, rating: 4.6, reviewCount: 25000, description: 'Denize dökülen muhteşem şelale ve piknik alanı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Duden_waterfall.jpg/640px-Duden_waterfall.jpg' },
  { id: 'ant-3', name: 'Konyaaltı Plajı', city: 'Antalya', category: 'doga', latitude: 36.887, longitude: 30.666, rating: 4.4, reviewCount: 32000, description: 'Toroslar manzarası eşliğinde mavi bayraklı halk plajı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Konyaalti_beach_Antalya.jpg/640px-Konyaalti_beach_Antalya.jpg' },
  { id: 'ant-4', name: 'Kaş Küçükçakıl Plajı', city: 'Antalya (Kaş)', category: 'doga', latitude: 36.202, longitude: 29.638, rating: 4.7, reviewCount: 7200, description: 'Derin mavi suları ve şnorkel imkanıyla Akdeniz\'in incisi.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Kas_beach_Turkey.jpg/640px-Kas_beach_Turkey.jpg' },

  // KONYA
  { id: 'kon-1', name: 'Mevlana Müzesi', city: 'Konya', category: 'muze', latitude: 37.871, longitude: 32.505, rating: 4.8, reviewCount: 68000, description: 'Hz. Mevlana\'nın türbesi ve eserleri.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mevlana_Museum_Konya.jpg/640px-Mevlana_Museum_Konya.jpg' },
  { id: 'kon-2', name: 'Beyşehir Gölü', city: 'Konya', category: 'doga', latitude: 37.69, longitude: 31.72, rating: 4.6, reviewCount: 8900, description: 'Türkiye\'nin en büyük tatlı su gölü çevresindeki milli park.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Lake_Beysehir.jpg/640px-Lake_Beysehir.jpg' },

  // MUĞLA
  { id: 'mug-1', name: 'Bodrum Bitez Plajı', city: 'Muğla (Bodrum)', category: 'doga', latitude: 37.017, longitude: 27.381, rating: 4.5, reviewCount: 9800, description: 'Sakin koyu ve turkuaz denizi ile aile tatili için ideal plaj.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Bodrum_beach.jpg/640px-Bodrum_beach.jpg' },
  { id: 'mug-2', name: 'Ölüdeniz Plajı', city: 'Muğla (Fethiye)', category: 'doga', latitude: 36.549, longitude: 29.115, rating: 4.9, reviewCount: 48000, description: 'Dünyanın en güzel plajlarından biri, lagün ve paraşüt atlaması.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Oludeniz_beach.jpg/640px-Oludeniz_beach.jpg' },

  // İSTANBUL
  { id: 'ist-1', name: 'Ayasofya', city: 'İstanbul', category: 'tarihi', latitude: 41.0086, longitude: 28.9802, rating: 4.8, reviewCount: 210000, description: 'Bizans ve Osmanlı dönemlerinden kalma tarihi yapı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Istanbul_2020.jpg/640px-Hagia_Sophia_Istanbul_2020.jpg' },
  { id: 'ist-2', name: 'Topkapı Sarayı Müzesi', city: 'İstanbul', category: 'muze', latitude: 41.0115, longitude: 28.9833, rating: 4.7, reviewCount: 95000, description: 'Osmanlı İmparatorluğu\'nun yönetim merkezi.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Topkapi_palace_main_building.jpg/640px-Topkapi_palace_main_building.jpg' },
  { id: 'ist-3', name: 'Polonezköy Piknik Parkı', city: 'İstanbul', category: 'doga', latitude: 41.178, longitude: 29.218, rating: 4.5, reviewCount: 14000, description: 'İstanbul\'a yakın orman içi piknik alanları.', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=70' },
  { id: 'ist-4', name: 'Sultanahmet Camii (Mavi Cami)', city: 'İstanbul', category: 'tarihi', latitude: 41.0054, longitude: 28.9768, rating: 4.8, reviewCount: 185000, description: 'Altı minaresiyle Osmanlı mimarisinin şaheseri.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Sultan_Ahmed_Mosque_Blue_Mosque.jpg/640px-Sultan_Ahmed_Mosque_Blue_Mosque.jpg' },

  // BOLU
  { id: 'bol-1', name: 'Abant Gölü Milli Parkı', city: 'Bolu', category: 'doga', latitude: 40.601, longitude: 31.282, rating: 4.8, reviewCount: 22000, description: 'Dört mevsim güzel, orman içi yürüyüş ve göl kenarı piknik alanları.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Abant_Lake.jpg/640px-Abant_Lake.jpg' },

  // SİNOP
  { id: 'sin-1', name: 'Hamsilos Koyu', city: 'Sinop', category: 'doga', latitude: 42.038, longitude: 35.088, rating: 4.8, reviewCount: 3200, description: 'Karadeniz\'in saklı cenneti, turkuaz renkli koy ve piknik alanı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Hamsilos_bay_Sinop.jpg/640px-Hamsilos_bay_Sinop.jpg' },

  // BURSA
  { id: 'bur-1', name: 'Uludağ Milli Parkı', city: 'Bursa', category: 'doga', latitude: 40.102, longitude: 29.22, rating: 4.7, reviewCount: 35000, description: 'Türkiye\'nin en ünlü kayak merkezi ve milli parkı.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Uludag_bursa.jpg/640px-Uludag_bursa.jpg' },
  { id: 'bur-2', name: 'Yeşil Türbe', city: 'Bursa', category: 'tarihi', latitude: 40.184, longitude: 29.071, rating: 4.6, reviewCount: 12000, description: 'Osmanlı mimarisinin şaheseri Yeşil Türbe.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Green_Tomb_Bursa.jpg/640px-Green_Tomb_Bursa.jpg' },

  // SAKARYA
  { id: 'sak-1', name: 'Sapanca Gölü Piknik Alanı', city: 'Sakarya', category: 'doga', latitude: 40.694, longitude: 30.268, rating: 4.6, reviewCount: 8900, description: 'Göl kenarında huzurlu piknik alanları ve doğa yürüyüşü.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sapanca_lake.jpg/640px-Sapanca_lake.jpg' },
];

export const PLACES = BASE_PLACES;
