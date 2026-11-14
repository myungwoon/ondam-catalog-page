// 상품 데이터 (가상). item_id 는 GA4 ecommerce items[].item_id 로 그대로 사용됩니다.
window.PRODUCTS = [
  { id: 'ondam-jeju-green', name: '제주 첫물 녹차', category: '녹차', price: 18000, salePrice: 15300, badge: 'BEST',
    c1: '#2f5d50', c2: '#88b29b', weight: '티백 20개입', caffeine: '중간',
    desc: '서귀포 차밭의 첫물 잎만 손으로 따서 덖었습니다. 은은한 단맛과 고소한 끝맛.', notes: ['감칠맛', '고소함', '풋풋함'], rating: 4.9, reviews: 1284 },
  { id: 'ondam-yuja-honeybush', name: '고흥 유자 허니부시', category: '허브티', price: 16000, salePrice: null, badge: 'NEW',
    c1: '#9c4a2f', c2: '#e2a26b', weight: '티백 20개입', caffeine: '없음',
    desc: '고흥 유자 껍질과 허니부시를 블렌딩한 무카페인 티. 저녁에도 부담 없어요.', notes: ['상큼함', '꿀향', '따뜻함'], rating: 4.8, reviews: 642 },
  { id: 'ondam-ginger-jujube', name: '생강 대추 블렌드', category: '허브티', price: 15000, salePrice: null, badge: null,
    c1: '#7a3b2e', c2: '#d98e5f', weight: '티백 20개입', caffeine: '없음',
    desc: '서산 생강과 보은 대추를 저온 건조해 몸을 데워 주는 겨울 블렌드.', notes: ['알싸함', '달큰함'], rating: 4.7, reviews: 518 },
  { id: 'ondam-balhyo-black', name: '하동 발효 홍차', category: '발효차', price: 22000, salePrice: 19800, badge: 'SALE',
    c1: '#4a2c2a', c2: '#a8674f', weight: '잎차 50g', caffeine: '높음',
    desc: '하동 야생 차나무 잎을 완전 발효해 꿀고구마 같은 단향을 냈습니다.', notes: ['꿀향', '몰트', '부드러움'], rating: 4.8, reviews: 377 },
  { id: 'ondam-sejak-premium', name: '보성 세작 프리미엄', category: '녹차', price: 32000, salePrice: null, badge: null,
    c1: '#3f6b3a', c2: '#b7cf8a', weight: '잎차 40g', caffeine: '중간',
    desc: '곡우 전후 어린 잎으로 만든 세작. 맑은 수색과 깔끔한 여운.', notes: ['맑음', '꽃향'], rating: 4.9, reviews: 211 },
  { id: 'ondam-gift-set', name: '사계절 선물 세트', category: '선물세트', price: 49000, salePrice: 44100, badge: 'GIFT',
    c1: '#2b3a55', c2: '#c9a96e', weight: '4종 × 티백 10개입', caffeine: '혼합',
    desc: '베스트 4종을 오동나무 상자에 담았습니다. 쇼핑백·메시지 카드 무료.', notes: ['선물용', '4종 구성'], rating: 4.9, reviews: 903 }
];
