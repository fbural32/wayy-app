import { Platform } from 'react-native';

// AdMob ID'leri
export const AD_UNIT_IDS = {
  // Gerçek ID'ler
  ios: {
    app: 'ca-app-pub-5819206818384477~1658791474',
    banner: 'ca-app-pub-5819206818384477/6915941872',
    rewarded: 'ca-app-pub-5819206818384477/7288989739',
  },
  // Test ID'leri (geliştirme sırasında kullan)
  test: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
};

// Şu an test modunda mı?
const IS_TEST = __DEV__;

export function getBannerAdId() {
  return IS_TEST ? AD_UNIT_IDS.test.banner : AD_UNIT_IDS.ios.banner;
}

export function getRewardedAdId() {
  return IS_TEST ? AD_UNIT_IDS.test.rewarded : AD_UNIT_IDS.ios.rewarded;
}
