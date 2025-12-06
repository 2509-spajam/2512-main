import { TravelRoute } from "../types";

export const mockRoutes: TravelRoute[] = [
  {
    id: "1",
    title: "東京タワー絶景ルート",
    authorName: "Yuki Tanaka",
    authorAvatar: "https://i.pravatar.cc/150?img=1",
    coverImage:
      "https://images.unsplash.com/photo-1748250696821-ef55891cf1b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMHRvd2VyJTIwamFwYW58ZW58MXx8fHwxNzY0OTg0MTM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description:
      "東京タワーを巡る半日コース。様々な角度から東京タワーを撮影できる絶景スポットを厳選しました。",
    totalDistance: "5.2 km",
    duration: "3時間",
    createdAt: "2025-11-15",
    spots: [
      {
        id: "s1-1",
        name: "東京タワー正面",
        imageUrl:
          "https://images.unsplash.com/photo-1748250696821-ef55891cf1b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMHRvd2VyJTIwamFwYW58ZW58MXx8fHwxNzY0OTg0MTM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.6586,
        lng: 139.7454,
        order: 1,
      },
      {
        id: "s1-2",
        name: "芝公園ビューポイント",
        imageUrl:
          "https://images.unsplash.com/photo-1748250696821-ef55891cf1b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMHRvd2VyJTIwamFwYW58ZW58MXx8fHwxNzY0OTg0MTM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.657,
        lng: 139.749,
        order: 2,
      },
      {
        id: "s1-3",
        name: "増上寺から",
        imageUrl:
          "https://images.unsplash.com/photo-1748250696821-ef55891cf1b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMHRvd2VyJTIwamFwYW58ZW58MXx8fHwxNzY0OTg0MTM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.6545,
        lng: 139.7481,
        order: 3,
      },
    ],
  },
  {
    id: "2",
    title: "京都古寺巡礼",
    authorName: "Sakura Yamamoto",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    coverImage:
      "https://images.unsplash.com/photo-1614360380098-63e2fbfda70b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxreW90byUyMHRlbXBsZXxlbnwxfHx8fDE3NjQ5MjA0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description:
      "京都の美しい寺院を訪れる1日ルート。紅葉の季節に特におすすめです。",
    totalDistance: "12.8 km",
    duration: "7時間",
    likes: 2180,
    syncAttempts: 1432,
    createdAt: "2025-10-28",
    spots: [
      {
        id: "s2-1",
        name: "金閣寺",
        imageUrl:
          "https://images.unsplash.com/photo-1614360380098-63e2fbfda70b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxreW90byUyMHRlbXBsZXxlbnwxfHx8fDE3NjQ5MjA0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.0394,
        lng: 135.7292,
        order: 1,
      },
      {
        id: "s2-2",
        name: "竜安寺石庭",
        imageUrl:
          "https://images.unsplash.com/photo-1614360380098-63e2fbfda70b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxreW90byUyMHRlbXBsZXxlbnwxfHx8fDE3NjQ5MjA0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.0345,
        lng: 135.7183,
        order: 2,
      },
      {
        id: "s2-3",
        name: "清水寺",
        imageUrl:
          "https://images.unsplash.com/photo-1614360380098-63e2fbfda70b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxreW90byUyMHRlbXBsZXxlbnwxfHx8fDE3NjQ5MjA0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 34.9949,
        lng: 135.785,
        order: 3,
      },
      {
        id: "s2-4",
        name: "伏見稲荷大社",
        imageUrl:
          "https://images.unsplash.com/photo-1614360380098-63e2fbfda70b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxreW90byUyMHRlbXBsZXxlbnwxfHx8fDE3NjQ5MjA0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 34.9671,
        lng: 135.7727,
        order: 4,
      },
    ],
  },
  {
    id: "3",
    title: "富士山絶景撮影スポット",
    authorName: "Kenji Sato",
    authorAvatar: "https://i.pravatar.cc/150?img=12",
    coverImage:
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudCUyMGZ1amklMjBqYXBhbnxlbnwxfHx8fDE3NjQ5MDgzNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description:
      "河口湖周辺から富士山を撮影する絶景ルート。早朝出発がおすすめです。",
    totalDistance: "18.5 km",
    duration: "5時間",
    likes: 3420,
    syncAttempts: 2145,
    createdAt: "2025-11-02",
    spots: [
      {
        id: "s3-1",
        name: "河口湖大石公園",
        imageUrl:
          "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudCUyMGZ1amklMjBqYXBhbnxlbnwxfHx8fDE3NjQ5MDgzNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.5126,
        lng: 138.7371,
        order: 1,
      },
      {
        id: "s3-2",
        name: "新倉山浅間公園",
        imageUrl:
          "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudCUyMGZ1amklMjBqYXBhbnxlbnwxfHx8fDE3NjQ5MDgzNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.5003,
        lng: 138.7951,
        order: 2,
      },
    ],
  },
  {
    id: "4",
    title: "大阪グルメストリート",
    authorName: "Mika Yoshida",
    authorAvatar: "https://i.pravatar.cc/150?img=9",
    coverImage:
      "https://images.unsplash.com/photo-1705580132909-95539e1ef843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2FrYSUyMHN0cmVldCUyMGZvb2R8ZW58MXx8fHwxNzY0OTI5NTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description:
      "大阪の食べ歩きスポットを巡るルート。たこ焼き、お好み焼き、串カツを制覇！",
    totalDistance: "6.3 km",
    duration: "4時間",
    likes: 1890,
    syncAttempts: 1256,
    createdAt: "2025-11-20",
    spots: [
      {
        id: "s4-1",
        name: "道頓堀",
        imageUrl:
          "https://images.unsplash.com/photo-1705580132909-95539e1ef843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2FrYSUyMHN0cmVldCUyMGZvb2R8ZW58MXx8fHwxNzY0OTI5NTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 34.6686,
        lng: 135.5005,
        order: 1,
      },
      {
        id: "s4-2",
        name: "黒門市場",
        imageUrl:
          "https://images.unsplash.com/photo-1705580132909-95539e1ef843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2FrYSUyMHN0cmVldCUyMGZvb2R8ZW58MXx8fHwxNzY0OTI5NTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 34.6654,
        lng: 135.5064,
        order: 2,
      },
      {
        id: "s4-3",
        name: "新世界",
        imageUrl:
          "https://images.unsplash.com/photo-1705580132909-95539e1ef843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2FrYSUyMHN0cmVldCUyMGZvb2R8ZW58MXx8fHwxNzY0OTI5NTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 34.6523,
        lng: 135.5061,
        order: 3,
      },
    ],
  },
  {
    id: "5",
    title: "渋谷ナイトフォト",
    authorName: "Ryo Nakamura",
    authorAvatar: "https://i.pravatar.cc/150?img=7",
    coverImage:
      "https://images.unsplash.com/photo-1643431452454-1612071b0671?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlidXlhJTIwY3Jvc3NpbmclMjB0b2t5b3xlbnwxfHx8fDE3NjQ5OTM4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description:
      "夜の渋谷をネオンと共に撮影。スクランブル交差点を中心としたフォトウォーク。",
    totalDistance: "3.1 km",
    duration: "2時間",
    likes: 2560,
    syncAttempts: 1876,
    createdAt: "2025-11-25",
    spots: [
      {
        id: "s5-1",
        name: "スクランブル交差点",
        imageUrl:
          "https://images.unsplash.com/photo-1643431452454-1612071b0671?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlidXlhJTIwY3Jvc3NpbmclMjB0b2t5b3xlbnwxfHx8fDE3NjQ5OTM4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.6595,
        lng: 139.7004,
        order: 1,
      },
      {
        id: "s5-2",
        name: "センター街入口",
        imageUrl:
          "https://images.unsplash.com/photo-1643431452454-1612071b0671?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlidXlhJTIwY3Jvc3NpbmclMjB0b2t5b3xlbnwxfHx8fDE3NjQ5OTM4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 35.661,
        lng: 139.6983,
        order: 2,
      },
    ],
  },
  {
    id: "6",
    title: "奈良公園 鹿とふれあい散策",
    authorName: "Hana Kimura",
    authorAvatar: "https://i.pravatar.cc/150?img=16",
    coverImage:
      "https://images.unsplash.com/photo-1732629558099-2f5b913c0885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXJhJTIwZGVlciUyMHBhcmt8ZW58MXx8fHwxNzY1MDAxMjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description:
      "奈良公園で鹿と触れ合いながら写真を撮るルート。かわいい鹿との共演写真が撮れます。",
    totalDistance: "4.7 km",
    duration: "3時間",
    likes: 1650,
    syncAttempts: 982,
    createdAt: "2025-11-10",
    spots: [
      {
        id: "s6-1",
        name: "奈良公園メインエリア",
        imageUrl:
          "https://images.unsplash.com/photo-1732629558099-2f5b913c0885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXJhJTIwZGVlciUyMHBhcmt8ZW58MXx8fHwxNzY1MDAxMjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 34.6851,
        lng: 135.8432,
        order: 1,
      },
      {
        id: "s6-2",
        name: "東大寺南大門前",
        imageUrl:
          "https://images.unsplash.com/photo-1732629558099-2f5b913c0885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXJhJTIwZGVlciUyMHBhcmt8ZW58MXx8fHwxNzY1MDAxMjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 34.6889,
        lng: 135.8398,
        order: 2,
      },
      {
        id: "s6-3",
        name: "若草山麓",
        imageUrl:
          "https://images.unsplash.com/photo-1732629558099-2f5b913c0885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXJhJTIwZGVlciUyMHBhcmt8ZW58MXx8fHwxNzY1MDAxMjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        lat: 34.6912,
        lng: 135.8475,
        order: 3,
      },
    ],
  },
];
