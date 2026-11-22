// Roomie Shared Frontend Shell Config
// Chỉ chứa cấu hình giao diện, thông tin liên hệ và điều hướng.
// Toàn bộ dữ liệu phòng trọ, roommate, trắc nghiệm, tài khoản và bảng giá được tải từ backend /api/bootstrap.

window.RoomieData = Object.assign(window.RoomieData || {}, {
  LOGO_URL: "/assets/images/common/logo.png",
  FOOTER_LOGO_URL: "/assets/images/common/logo.png",
  CONTRACT_DOC_URL: "/assets/docs/Roomie_Thoa_Thuan_Noi_Quy_O_Ghep.pdf",

  CONTACT_INFO: {
    brandName: "Roomie",
    slogan: "Tìm đúng phòng - Ghép đúng người — Sống chung bình yên",
    badge: "Gen Z Housing",
    copyrightYear: "2026",
    phone: "+84 777 639 593",
    tel: "+84777639593",
    zalo: "0777639593",
    email: "roomie2026@gmail.com",
    address: "227 Nguyễn Văn Cừ, Chợ Quán, TPHCM",
    supportHours: "08:00 – 18:00"
  },

  NAV_ITEMS: [
    { key: "trang-chu", label: "Trang chủ", mobileLabel: "Trang chủ", href: "/roomie" },
    { key: "tim-phong", label: "Tìm phòng", mobileLabel: "Tìm phòng trọ", href: "/roomie/tim-phong" },
    { key: "tim-roommate", label: "Tìm roommate", mobileLabel: "Tìm roommate", href: "/roomie/tim-roommate" },
    { key: "trac-nghiem-hop-gu", label: "Trắc nghiệm", mobileLabel: "Trắc nghiệm hợp gu", href: "/roomie/trac-nghiem" },
    { key: "dich-vu", label: "Dịch vụ", mobileLabel: "Bảng giá dịch vụ", href: "/roomie/bang-gia" },
    { key: "ve-chung-toi", label: "Về chúng tôi", mobileLabel: "Về chúng tôi", href: "/roomie/ve-chung-toi" },
    { key: "lien-he", label: "Liên hệ", mobileLabel: "Liên hệ", href: "/roomie/lien-he" }
  ],

  FOOTER_COLUMNS: [
    {
      title: "Khám phá",
      links: [
        { key: "trang-chu", label: "Trang chủ", href: "/roomie" },
        { key: "ve-chung-toi", label: "Giới thiệu", href: "/roomie/ve-chung-toi" },
        { key: "tim-phong", label: "Tìm phòng trọ", href: "/roomie/tim-phong" },
        { key: "tim-roommate", label: "Tìm roommate hợp gu", href: "/roomie/tim-roommate" },
        { key: "trac-nghiem-tinh-cach", label: "Trắc nghiệm tính cách", href: "/roomie/trac-nghiem" },
        { key: "tin-da-dang", label: "Tin đăng của tôi", href: "/roomie/tin-da-dang" },
        { key: "dich-vu", label: "Dịch vụ", href: "/roomie/bang-gia" },
        { key: "lien-he", label: "Liên hệ", href: "/roomie/lien-he" }
      ]
    },
    {
      title: "Dịch vụ & Gói",
      links: [
        { key: "dich-vu", label: "Thêm 3 tin/ngày", href: "/roomie/bang-gia#pkg-extra-posts-day" },
        { key: "dich-vu", label: "Đẩy tin 24 giờ", href: "/roomie/bang-gia#pkg-boost-24h" },
        { key: "dich-vu", label: "Đẩy tin 7 ngày", href: "/roomie/bang-gia#pkg-boost-7d" },
        { key: "dich-vu", label: "Match không giới hạn", href: "/roomie/bang-gia#pkg-unlimited-matches-day" },
        { key: "dich-vu", label: "Trọn bộ 30 ngày", href: "/roomie/bang-gia#pkg-all-in-one" },
        { key: "bang-gia", label: "Bảng giá dịch vụ", href: "/roomie/bang-gia" }
      ]
    },
    {
      title: "Hỗ trợ & An toàn",
      links: [
        { key: "nguyen-tac-an-toan", label: "Nguyên tắc an toàn", href: "/roomie/an-toan#nguyen-tac" },
        { key: "bao-cao-tin-gia", label: "Báo cáo tin giả / lừa đảo", href: "/roomie/an-toan#bao-cao" },
        { key: "lien-he-faq", label: "Liên hệ & FAQ sinh viên", href: "/roomie/an-toan#faq" },
        { key: "quy-chuan-cong-dong", label: "Quy chuẩn cộng đồng", href: "/roomie/an-toan#quy-chuan" }
      ]
    }
  ],

  ROUTES: {
    "trang-chu": "/roomie",
    "tim-phong": "/roomie/tim-phong",
    "khu-vuc-lang-dai-hoc": "/roomie/tim-phong?area=thu-duc",
    "phong-chi-tiet": "/roomie/phong-chi-tiet?id=1",
    "phong-chi-tiet-1": "/roomie/phong-chi-tiet?id=1",
    "phong-chi-tiet-2": "/roomie/phong-chi-tiet?id=2",
    "phong-chi-tiet-3": "/roomie/phong-chi-tiet?id=3",
    "phong-chi-tiet-4": "/roomie/phong-chi-tiet?id=4",
    "phong-chi-tiet-5": "/roomie/phong-chi-tiet?id=5",
    "phong-chi-tiet-6": "/roomie/phong-chi-tiet?id=6",
    "phong-chi-tiet-7": "/roomie/phong-chi-tiet?id=7",
    "phong-chi-tiet-8": "/roomie/phong-chi-tiet?id=8",
    "phong-chi-tiet-9": "/roomie/phong-chi-tiet?id=9",
    "tim-roommate": "/roomie/tim-roommate",
    "ket-qua-match": "/roomie/tim-roommate",
    "trac-nghiem-tinh-cach": "/roomie/trac-nghiem",
    "trac-nghiem-hop-gu": "/roomie/trac-nghiem",
    "dang-tin": "/roomie/dang-tin",
    "dang-tin-mien-phi": "/roomie/dang-tin",
    "tin-da-dang": "/roomie/tin-da-dang",
    "dich-vu": "/roomie/bang-gia",
    "bang-gia": "/roomie/bang-gia",
    "ve-chung-toi": "/roomie/ve-chung-toi",
    "lien-he": "/roomie/lien-he",
    "nguyen-tac-an-toan": "/roomie/an-toan#nguyen-tac",
    "bao-cao-tin-gia": "/roomie/an-toan#bao-cao",
    "lien-he-faq": "/roomie/an-toan#faq",
    "quy-chuan-cong-dong": "/roomie/an-toan#quy-chuan"
  },

  USER_PROFILE: null,
  ROOMS: [],
  ROOMMATES: [],
  QUIZ_QUESTIONS: [],
  PRICING_PACKAGES: [],
  NOTIFICATIONS: []
});
