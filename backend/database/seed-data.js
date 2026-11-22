/**
 * Roomie Match - Canonical Seed Dataset for Backend & Supabase PostgreSQL
 * Toàn bộ dữ liệu nghiệp vụ, câu hỏi trắc nghiệm và tài khoản demo nằm 100% ở backend/database.
 */

const SEED_USERS = [
  {
    id: 'user-minhthu',
    name: 'Minh Thư',
    email: 'minhthu@student.hcmus.edu.vn',
    altEmail: '22120***@student.hcmus.edu.vn',
    password: '123',
    shortSchool: 'HCMUS',
    school: 'ĐH Khoa học Tự nhiên (HCMUS)',
    major: 'Khoa CNTT • K22',
    gender: 'Nữ',
    idCode: '#SV-8924',
    avatar: '/assets/images/common/avatar-profile.jpg',
    budgetRange: '1.8 - 2.5 tr/tháng',
    preferredAreas: 'Làng ĐHQG / Quận 5',
    moveInTime: 'Đầu tháng tới',
    verifiedStudent: true,
    role: 'student'
  },
  {
    id: 'user-hoangnam',
    name: 'Hoàng Nam',
    email: 'hoangnam@student.hcmus.edu.vn',
    altEmail: '22120512@student.hcmus.edu.vn',
    password: '123',
    shortSchool: 'HCMUS',
    school: 'ĐH Khoa học Tự nhiên (HCMUS)',
    major: 'Khoa CNTT • K22',
    gender: 'Nam',
    idCode: '#SV-5120',
    avatar: '/assets/images/phong-chi-tiet/avatar-1.jpg',
    budgetRange: '2.0 - 2.6 tr/tháng',
    preferredAreas: 'Làng ĐHQG Thủ Đức',
    moveInTime: 'Sẵn sàng ở ngay',
    verifiedStudent: true,
    role: 'student'
  },
  {
    id: 'user-landlord-q5',
    name: 'Anh Tuấn (Chủ nhà Q.5)',
    email: 'chutro.q5@roomie.vn',
    altEmail: 'tuan.landlord@roomie.vn',
    password: 'RoomieLandlord!2026',
    shortSchool: 'Chủ nhà',
    school: 'Chủ nhà xác thực · 227 Nguyễn Văn Cừ, Q.5',
    major: 'Đối tác nhà trọ sinh viên',
    gender: 'Nam',
    idCode: '#CN-0501',
    avatar: '/assets/images/trac-nghiem/avatar-1.jpg',
    budgetRange: '3.5 - 5.5 tr/tháng',
    preferredAreas: 'Quận 5',
    moveInTime: 'Phòng sẵn sàng ngay',
    verifiedStudent: true,
    role: 'landlord'
  },
  {
    id: 'user-admin',
    name: 'Quản trị viên Roomie',
    email: 'admin@roomie.vn',
    altEmail: null,
    password: process.env.ROOMIE_ADMIN_PASSWORD || 'RoomieAdmin!2026',
    shortSchool: 'ADMIN',
    school: 'Hệ thống Roomie Match',
    major: 'Kiểm duyệt & An toàn cộng đồng',
    gender: 'Nữ',
    idCode: '#ADM-001',
    avatar: '/assets/images/common/logo.png',
    budgetRange: '',
    preferredAreas: 'Toàn hệ thống',
    moveInTime: '',
    verifiedStudent: true,
    role: 'admin'
  }
];

const SEED_ROOMS = [
  {
    id: '1',
    ownerId: 'user-hoangnam',
    city: 'TP.HCM',
    title: 'Phòng Studio Ban Công Thoáng Mát – Đối Diện KTX Khu B ĐHQG',
    shortTitle: 'KTX & Làng Đại học Thủ Đức',
    breadcrumbTitle: 'KTX & Phòng trọ Làng Đại học CS2',
    districtLabel: 'TP. Thủ Đức',
    areaKey: 'thu-duc',
    address: 'Đường Vành Đai, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh (Cạnh trạm buýt KTX Khu B)',
    shortAddress: 'Thủ Đức · KTX B',
    distanceLabel: 'Cách ĐH KHTN CS2 500m',
    schoolDistanceBadge: 'Cách ĐH KHTN CS2 500m',
    price: 2300000,
    priceFormatted: '2.300.000đ',
    totalRoomPrice: '4.600.000đ/tháng',
    areaSqm: 28,
    capacityLabel: 'Tối đa 2 Nam',
    spotsLabel: 'Còn 1 chỗ ở ghép nam',
    badgeText: 'Trống 1 giường',
    floorLabel: 'Tầng 3 (Thang máy)',
    depositLabel: '1 tháng cọc',
    typeKey: 'o-ghep',
    typeLabel: 'Ở ghép',
    matchScore: 94,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: true,
    amenities: ['Máy lạnh', 'Máy giặt', 'Máy nước nóng', 'Tủ giày', 'Giờ linh hoạt', 'Ban công'],
    summarySpecs: '28m² • Máy lạnh, ban công, giờ tự do',
    images: [
      '/assets/images/phong-chi-tiet/room-1.jpg',
      '/assets/images/phong-chi-tiet/room-2.jpg',
      '/assets/images/phong-chi-tiet/room-3.jpg',
      '/assets/images/phong-chi-tiet/room-4.jpg'
    ],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'hoang-nam',
      name: 'Hoàng Nam',
      age: '20 tuổi',
      bioTitle: 'Sinh viên Năm 2 • Khoa CNTT, ĐH Khoa học Tự nhiên TP.HCM (HCMUS)',
      note: 'Tìm bạn cùng phòng tính tình hòa nhã, tôn trọng giờ giấc',
      avatar: '/assets/images/phong-chi-tiet/avatar-1.jpg',
      contact: {
        phone: '0901 234 512',
        zalo: '0901234512',
        facebook: 'fb.com/hoangnam.hcmus'
      },
      habits: [
        'Ngủ trước 23h30',
        'Không hút thuốc',
        'Giữ trật tự giờ ôn thi',
        'Thích tự nấu ăn',
        'Không nuôi thú cưng',
        'Dọn phòng luân phiên 2 lần/tuần'
      ]
    },
    costs: {
      electric: '3.500đ / kWh',
      electricNote: 'Đồng hồ điện riêng trước cửa phòng',
      water: '50.000đ / người / tháng',
      waterNote: 'Nước máy thủy cục sạch',
      service: '50.000đ / người / tháng',
      serviceNote: '(100.000đ / phòng)',
      parking: 'Miễn phí',
      parkingNote: 'Tối đa 1 xe/người trong hầm',
      estimatedTotal: '~ 2.500.000đ - 2.650.000đ'
    },
    description: [
      'Phòng nằm ở tầng 3 tòa nhà 5 tầng mới xây, cách ĐH KHTN CS2 và KTX Khu B ĐHQG chỉ 500m. Có thang máy hiện đại, camera an ninh 24/7 và hệ thống khóa vân tay riêng từng tầng nên cực kỳ an tâm cho sinh viên.',
      'Phòng có ban công riêng cực thoáng mát đón gió tự nhiên, view nhìn ra hàng cây xanh của khuôn viên Làng Đại học, không bị khuất nắng. Đã trang bị sẵn giường đôi tầng trên/dưới loại cao cấp chịu lực, 2 bàn học gỗ có giá sách, tủ quần áo riêng 2 buồng, máy lạnh Inverter tiết kiệm điện.',
      'Hiện bạn Nam (SV KHTN) đang ở giường dưới, cần tìm thêm 1 bạn nam gọn gàng vào ở giường trên để san sẻ chi phí tiền phòng. Chủ nhà thân thiện, không ở chung, giờ giấc hoàn toàn tự do.'
    ]
  },
  {
    id: '2',
    ownerId: 'user-minhthu',
    city: 'TP.HCM',
    title: 'Phòng Share Rộng Rãi Điện Biên Phủ – Gần HUTECH & UEF',
    shortTitle: 'Điện Biên Phủ, P.25 Bình Thạnh',
    breadcrumbTitle: 'Điện Biên Phủ, P.25 Bình Thạnh',
    districtLabel: 'Bình Thạnh',
    areaKey: 'binh-thanh',
    address: 'Hẻm 214 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM (Cách ngã tư Hàng Xanh 300m)',
    shortAddress: 'Bình Thạnh',
    distanceLabel: 'Gần HUTECH & UEF (Bình Thạnh)',
    schoolDistanceBadge: 'Cách HUTECH 400m',
    price: 1800000,
    priceFormatted: '1.800.000đ',
    totalRoomPrice: '5.400.000đ/tháng (chia 3)',
    areaSqm: 35,
    capacityLabel: 'Tối đa 3 bạn',
    spotsLabel: 'Còn 2 chỗ ở ghép',
    badgeText: 'Còn 2 chỗ',
    floorLabel: 'Tầng 2 (Có hầm xe)',
    depositLabel: '1 tháng cọc',
    typeKey: 'o-ghep',
    typeLabel: 'Ở ghép',
    matchScore: 91,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: false,
    amenities: ['Máy lạnh', 'Máy giặt', 'Giờ linh hoạt', 'Khu vực để xe'],
    summarySpecs: '35m² • WC riêng, tủ lạnh, máy giặt',
    images: [
      '/assets/images/trang-chu/room-2.jpg',
      '/assets/images/tim-phong/room-2.jpg'
    ],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'thao-vy',
      name: 'Thảo Vy',
      age: '19 tuổi',
      bioTitle: 'Sinh viên Năm 1 • ĐH KHXH&NV & HUTECH, Bình Thạnh',
      note: 'Tìm bạn nữ sạch sẽ, ưu tiên học tập yên tĩnh, nấu ăn nhẹ',
      avatar: '/assets/images/dang-tin/avatar-1.jpg',
      contact: {
        phone: '0903 456 781',
        zalo: '0903456781',
        facebook: 'fb.com/thaovy.ussh'
      },
      habits: ['Ngủ trước 23h30', 'Không hút thuốc', 'Sạch sẽ gọn gàng', 'Tôn trọng riêng tư']
    },
    costs: {
      electric: '3.500đ / kWh',
      electricNote: 'Chia đều theo đầu người cuối tháng',
      water: '80.000đ / người / tháng',
      waterNote: 'Nước máy không giới hạn',
      service: '40.000đ / người / tháng',
      serviceNote: 'Wifi cáp quang + rác',
      parking: '100.000đ / xe / tháng',
      parkingNote: 'Nhà xe khóa từ trong nhà',
      estimatedTotal: '~ 2.050.000đ - 2.200.000đ'
    },
    description: [
      'Phòng rộng 35m² tại khu dân cư văn minh ngay sát ĐH HUTECH và UEF, đi bộ ra trạm xe buýt và Landmark 81 chỉ 5 phút.',
      'Có sẵn WC riêng sạch sẽ, tủ lạnh 180L, máy giặt riêng trên sân phơi thoáng, cửa sổ lớn đón ánh sáng tự nhiên cả ngày.',
      'Phòng rất phù hợp cho nhóm bạn hoặc sinh viên mới lên TP.HCM muốn tiết kiệm chi phí mà vẫn có không gian sinh hoạt thoải mái.'
    ]
  },
  {
    id: '3',
    ownerId: 'user-landlord-q5',
    city: 'TP.HCM',
    title: 'Phòng Trọ Cao Cấp Full Nội Thất – Đối Diện HCMUS CS1',
    shortTitle: 'Phòng trọ cao cấp Full nội thất',
    breadcrumbTitle: 'Nguyễn Văn Cừ, Quận 5',
    districtLabel: 'Quận 5',
    areaKey: 'quan-5',
    address: '227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM (Đối diện cổng ĐH Khoa học Tự nhiên CS1)',
    shortAddress: 'Quận 5 · Gần KHTN',
    distanceLabel: 'Nguyễn Văn Cừ, Quận 5',
    schoolDistanceBadge: 'Đối diện HCMUS CS1 (50m)',
    price: 5000000,
    priceFormatted: '5.000.000đ',
    totalRoomPrice: '5.000.000đ/tháng',
    areaSqm: 25,
    capacityLabel: 'Nguyên phòng (tối đa 2 người)',
    spotsLabel: 'Nguyên phòng riêng',
    badgeText: 'Nguyên phòng',
    floorLabel: 'Tầng 4 (Thang máy)',
    depositLabel: '1 tháng cọc',
    typeKey: 'phong-rieng',
    typeLabel: 'Phòng riêng',
    matchScore: 95,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: false,
    amenities: ['Máy lạnh', 'Máy nước nóng', 'Giờ linh hoạt', 'Khu vực để xe'],
    summarySpecs: '25m² • Nguyên phòng, camera an ninh',
    images: [
      '/assets/images/trang-chu/room-3.jpg',
      '/assets/images/tim-phong/room-3.jpg'
    ],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'chu-nha-q5',
      name: 'Anh Tuấn (Chủ nhà)',
      age: 'Chính chủ',
      bioTitle: 'Chủ nhà xác thực • Quản lý tòa nhà 227 Nguyễn Văn Cừ, Q.5',
      note: 'Cho thuê nguyên phòng riêng tư, hợp đồng rõ ràng, hỗ trợ xem phòng trong ngày',
      avatar: '/assets/images/trac-nghiem/avatar-1.jpg',
      contact: {
        phone: '0907 881 234',
        zalo: '0907881234',
        facebook: 'fb.com/nhatro.nguyenvancu'
      },
      habits: ['Hợp đồng minh bạch', 'Không chung chủ', 'Giờ giấc tự do 24/7', 'An ninh thẻ từ']
    },
    costs: {
      electric: '3.800đ / kWh',
      electricNote: 'Công tơ riêng chuẩn nhà nước',
      water: '70.000đ / người / tháng',
      waterNote: 'Nước máy sạch',
      service: 'Miễn phí',
      serviceNote: 'Đã bao gồm Wifi + vệ sinh hành lang',
      parking: '120.000đ / xe / tháng',
      parkingNote: 'Thẻ từ bảo vệ 24/24',
      estimatedTotal: '~ 5.300.000đ - 5.500.000đ'
    },
    description: [
      'Vị trí vàng ngay khu trung tâm Quận 5 — chỉ cần băng qua đường là tới giảng đường ĐH Khoa học Tự nhiên CS1, ĐH Sư phạm TP.HCM và ĐH Sài Gòn.',
      'Phòng có gác gỗ ấm cúng, đầy đủ bàn học, tủ đồ, máy lạnh, máy nước nóng, cửa khóa thẻ từ an toàn tuyệt đối. Gần Nowzone, siêu thị và hàng quán sinh viên.'
    ]
  },
  {
    id: '4',
    ownerId: null,
    city: 'TP.HCM',
    title: 'Nhà Nguyên Căn Share Phòng – Quang Trung, Gò Vấp',
    shortTitle: 'Nhà nguyên căn share phòng',
    breadcrumbTitle: 'Quang Trung, Gò Vấp',
    districtLabel: 'Gò Vấp',
    areaKey: 'go-vap',
    address: 'Hẻm 350 Quang Trung, Phường 10, Gò Vấp, TP.HCM (Gần ĐH Công Nghiệp IUH)',
    shortAddress: 'Gò Vấp',
    distanceLabel: 'Quang Trung, Gò Vấp',
    schoolDistanceBadge: 'Cách ĐH Công Nghiệp IUH 700m',
    price: 1600000,
    priceFormatted: '1.600.000đ',
    totalRoomPrice: '3.200.000đ/tháng',
    areaSqm: 30,
    capacityLabel: 'Tối đa 2 người',
    spotsLabel: 'Còn 1 chỗ giá tốt',
    badgeText: 'Giá tốt',
    floorLabel: 'Lầu 1 (Nhà nguyên căn)',
    depositLabel: '1 tháng cọc',
    typeKey: 'o-ghep',
    typeLabel: 'Ở ghép',
    matchScore: 88,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: false,
    amenities: ['Máy lạnh', 'Máy giặt', 'Tủ giày', 'Giờ linh hoạt', 'Khu vực để xe'],
    summarySpecs: '30m² • Nấu ăn thoải mái, xe free',
    images: [
      '/assets/images/trang-chu/room-4.jpg',
      '/assets/images/tim-phong/room-4.jpg'
    ],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'huu-thang',
      name: 'Hữu Thắng',
      age: '21 tuổi',
      bioTitle: 'Sinh viên Năm 3 • ĐH Công nghiệp TP.HCM (IUH)',
      note: 'Thoải mái nấu ăn chung, giữ nhà để xe gọn gàng',
      avatar: '/assets/images/phong-chi-tiet/avatar-2.jpg',
      contact: {
        phone: '0908 112 345',
        zalo: '0908112345',
        facebook: 'fb.com/huuthang.iuh'
      },
      habits: ['Sạch sẽ', 'Dậy sớm', 'Nấu ăn chung', 'Không hút thuốc']
    },
    costs: {
      electric: 'Giá nhà nước (~2.800đ/kWh)',
      electricNote: 'Chia đều theo hóa đơn điện lực',
      water: '35.000đ / người / tháng',
      waterNote: 'Hóa đơn nhà nước',
      service: '50.000đ / người / tháng',
      serviceNote: 'Wifi tốc độ cao + rác',
      parking: 'Miễn phí',
      parkingNote: 'Tầng trệt để được 6 xe máy',
      estimatedTotal: '~ 1.800.000đ - 1.950.000đ'
    },
    description: [
      'Nhà nguyên căn 2 lầu hẻm xe hơi yên tĩnh, có bếp riêng rộng rãi tầng trệt cho sinh viên tự nấu ăn tiết kiệm chi phí.',
      'Giá điện nước tính theo hóa đơn nhà nước siêu rẻ, không thu thêm phí giữ xe.'
    ]
  },
  {
    id: '5',
    ownerId: null,
    city: 'TP.HCM',
    title: 'Căn Hộ Ban Công Nguyễn Gia Trí (D2) – Bình Thạnh',
    shortTitle: 'Căn hộ ban công Nguyễn Gia Trí',
    breadcrumbTitle: 'Nguyễn Gia Trí, Bình Thạnh',
    districtLabel: 'Bình Thạnh',
    areaKey: 'binh-thanh',
    address: 'Đường Nguyễn Gia Trí (D2 cũ), Phường 25, Bình Thạnh, TP.HCM',
    shortAddress: 'Bình Thạnh',
    distanceLabel: 'Gần FTU2, HUTECH, GTVT',
    schoolDistanceBadge: 'Cách FTU2 / HUTECH 350m',
    price: 2400000,
    priceFormatted: '2.400.000đ',
    totalRoomPrice: '4.800.000đ/tháng',
    areaSqm: 28,
    capacityLabel: 'Tối đa 2 Nữ',
    spotsLabel: 'Còn 1 bạn nữ',
    badgeText: 'Căn hộ mini',
    floorLabel: 'Tầng 3 (Thang máy)',
    depositLabel: '1 tháng cọc',
    typeKey: 'can-ho',
    typeLabel: 'Căn hộ mini',
    matchScore: 93,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: false,
    amenities: ['Máy lạnh', 'Máy giặt', 'Máy nước nóng', 'Giờ linh hoạt'],
    summarySpecs: '28m² • Còn 1 bạn nữ',
    images: ['/assets/images/tim-phong/room-2.jpg'],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'khanh-linh',
      name: 'Khánh Linh',
      age: '20 tuổi',
      bioTitle: 'Sinh viên Năm 2 • ĐH Ngoại thương CS2 (FTU2)',
      note: 'Ưu tiên bạn nữ gọn gàng, không dắt người lạ qua đêm',
      avatar: '/assets/images/dang-tin/avatar-1.jpg',
      contact: {
        phone: '0905 612 834',
        zalo: '0905612834',
        facebook: 'fb.com/khanhlinh.ftu2'
      },
      habits: ['Sạch sẽ', 'Thích nấu ăn', 'Không hút thuốc', 'Giữ trật tự']
    },
    costs: {
      electric: '3.500đ / kWh',
      electricNote: 'Đồng hồ điện riêng',
      water: '100.000đ / người / tháng',
      waterNote: 'Nước máy sạch',
      service: '50.000đ / người / tháng',
      serviceNote: 'Wifi + thang máy + vệ sinh',
      parking: '100.000đ / xe / tháng',
      parkingNote: 'Hầm xe bảo vệ',
      estimatedTotal: '~ 2.700.000đ - 2.850.000đ'
    },
    description: [
      'Căn hộ mini ngay trung tâm trục đường D2 sầm uất, cực tiện đi học FTU2, HUTECH, GTVT và UEF.',
      'Có ban công phơi đồ thoáng, nội thất gỗ hiện đại, bảo vệ trực 24/7.'
    ]
  },
  {
    id: '6',
    ownerId: null,
    city: 'TP.HCM',
    title: 'Studio Duplex Tô Hiến Thành – Quận 10',
    shortTitle: 'Studio duplex Tô Hiến Thành',
    breadcrumbTitle: 'Tô Hiến Thành, Quận 10',
    districtLabel: 'Quận 10',
    areaKey: 'quan-10',
    address: 'Đường Tô Hiến Thành, Phường 14, Quận 10, TP.HCM (Sát ĐH Bách Khoa CS1)',
    shortAddress: 'Quận 10',
    distanceLabel: 'Gần ĐH Bách Khoa CS1 (Q.10)',
    schoolDistanceBadge: 'Cách HCMUT CS1 300m',
    price: 2800000,
    priceFormatted: '2.800.000đ',
    totalRoomPrice: '5.600.000đ/tháng',
    areaSqm: 35,
    capacityLabel: 'Tối đa 2 Nữ',
    spotsLabel: 'Còn 1 bạn nữ',
    badgeText: 'Duplex',
    floorLabel: 'Tầng 5 (Thang máy)',
    depositLabel: '1 tháng cọc',
    typeKey: 'can-ho',
    typeLabel: 'Duplex',
    matchScore: 94,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: false,
    amenities: ['Máy lạnh', 'Máy giặt', 'Máy nước nóng', 'Tủ giày', 'Giờ linh hoạt', 'Khu vực để xe'],
    summarySpecs: '35m² • Còn 1 bạn nữ',
    images: ['/assets/images/tim-phong/room-5.jpg'],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'minh-anh',
      name: 'Lê Minh Anh',
      age: '20 tuổi',
      bioTitle: 'Sinh viên Năm 2 • ĐH Khoa học Tự nhiên (HCMUS)',
      note: 'Ở sạch sẽ, phân chia lịch vệ sinh rõ ràng',
      avatar: '/assets/images/trac-nghiem/avatar-2.jpg',
      contact: {
        phone: '0902 345 674',
        zalo: '0902345674',
        facebook: 'fb.com/minhanh.hcmus'
      },
      habits: ['Ngủ sau 23h', 'Yên tĩnh ôn thi', 'Không thú cưng', 'Rạch ròi hóa đơn']
    },
    costs: {
      electric: '3.800đ / kWh',
      electricNote: 'Đồng hồ điện riêng',
      water: '80.000đ / người / tháng',
      waterNote: 'Nước thủy cục',
      service: '70.000đ / người / tháng',
      serviceNote: 'Wifi + thang máy + rác',
      parking: '120.000đ / xe / tháng',
      parkingNote: 'Hầm xe bảo vệ 24/7',
      estimatedTotal: '~ 3.100.000đ'
    },
    description: [
      'Studio thiết kế gác duplex cao trần thoáng đãng ngay mặt hẻm lớn Tô Hiến Thành, sát BigC Miền Đông và ĐH Bách Khoa.',
      'Có sẵn máy lạnh, tủ lạnh, bàn làm việc và cửa sổ kính lớn.'
    ]
  },
  {
    id: '7',
    ownerId: null,
    city: 'Hà Nội',
    title: 'Phòng Trọ Gác Xép Ngõ 165 Xuân Thủy – Gần ĐHQG Hà Nội',
    shortTitle: 'Xuân Thủy, Cầu Giấy',
    breadcrumbTitle: 'Xuân Thủy, Cầu Giấy',
    districtLabel: 'Cầu Giấy',
    areaKey: 'cau-giay',
    address: 'Ngõ 165 Xuân Thủy, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
    shortAddress: 'Cầu Giấy · Hà Nội',
    distanceLabel: 'Cách ĐHQG Hà Nội & HNUE 350m',
    schoolDistanceBadge: 'Cách VNU-UET / HNUE 350m',
    price: 2100000,
    priceFormatted: '2.100.000đ',
    totalRoomPrice: '4.200.000đ/tháng',
    areaSqm: 26,
    capacityLabel: 'Tối đa 2 Nữ',
    spotsLabel: 'Còn 1 chỗ ở ghép nữ',
    badgeText: 'Cầu Giấy',
    floorLabel: 'Tầng 3 (Thang máy)',
    depositLabel: '1 tháng cọc',
    typeKey: 'o-ghep',
    typeLabel: 'Ở ghép',
    matchScore: 93,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: false,
    amenities: ['Máy lạnh', 'Máy giặt', 'Máy nước nóng', 'Tủ giày', 'Giờ linh hoạt'],
    summarySpecs: '26m² • Gác xép gỗ, gần ĐHQG HN',
    images: [
      '/assets/images/tim-phong/room-1.jpg',
      '/assets/images/phong-chi-tiet/room-5.jpg'
    ],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'ha-linh',
      name: 'Nguyễn Hà Linh',
      age: '20 tuổi',
      bioTitle: 'Sinh viên Năm 2 • ĐH Ngoại ngữ - ĐHQGHN (ULIS)',
      note: 'Cần tìm 1 bạn nữ gọn gàng, yên tĩnh buổi tối',
      avatar: '/assets/images/dang-tin/avatar-1.jpg',
      contact: {
        phone: '0912 348 765',
        zalo: '0912348765',
        facebook: 'fb.com/halinh.ulis'
      },
      habits: ['Ngủ trước 23h30', 'Không hút thuốc', 'Giữ trật tự ôn thi', 'Sạch sẽ']
    },
    costs: {
      electric: '3.500đ / kWh',
      electricNote: 'Công tơ riêng từng phòng',
      water: '70.000đ / người / tháng',
      waterNote: 'Nước sạch sông Đà',
      service: '50.000đ / người / tháng',
      serviceNote: 'Wifi + vệ sinh hành lang',
      parking: 'Miễn phí',
      parkingNote: 'Nhà xe tầng 1 khóa vân tay',
      estimatedTotal: '~ 2.350.000đ - 2.500.000đ'
    },
    description: [
      'Phòng gác xép sáng sủa ngay ngõ 165 Xuân Thủy, đi bộ 5 phút tới ĐH Ngoại ngữ, ĐH Công nghệ ĐHQGHN, ĐH Sư phạm Hà Nội và Học viện Báo chí.',
      'Trang bị sẵn điều hòa 2 chiều, bình nóng lạnh, tủ giày gỗ, máy giặt chung trên tầng thượng.'
    ]
  },
  {
    id: '8',
    ownerId: null,
    city: 'Hà Nội',
    title: 'Phòng Studio Ngõ 40 Tạ Quang Bửu – Gần Bách Khoa & NEU',
    shortTitle: 'Tạ Quang Bửu, Hai Bà Trưng',
    breadcrumbTitle: 'Tạ Quang Bửu, Hai Bà Trưng',
    districtLabel: 'Hai Bà Trưng',
    areaKey: 'hai-ba-trung',
    address: 'Ngõ 40 Tạ Quang Bửu, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội',
    shortAddress: 'Hai Bà Trưng · HN',
    distanceLabel: 'Cách ĐH Bách Khoa HN & NEU 400m',
    schoolDistanceBadge: 'Cách HUST / NEU 400m',
    price: 2200000,
    priceFormatted: '2.200.000đ',
    totalRoomPrice: '4.400.000đ/tháng',
    areaSqm: 28,
    capacityLabel: 'Tối đa 2 Nam',
    spotsLabel: 'Còn 1 chỗ ở ghép nam',
    badgeText: 'Gần HUST',
    floorLabel: 'Tầng 4 (Thang máy)',
    depositLabel: '1 tháng cọc',
    typeKey: 'o-ghep',
    typeLabel: 'Ở ghép',
    matchScore: 91,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: false,
    amenities: ['Máy lạnh', 'Máy giặt', 'Máy nước nóng', 'Khu vực để xe', 'Giờ linh hoạt'],
    summarySpecs: '28m² • Full đồ, đi bộ ra HUST',
    images: [
      '/assets/images/tim-phong/room-6.jpg',
      '/assets/images/phong-chi-tiet/room-6.jpg'
    ],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'duc-minh',
      name: 'Trần Đức Minh',
      age: '21 tuổi',
      bioTitle: 'Sinh viên Năm 3 • ĐH Bách khoa Hà Nội (HUST)',
      note: 'Thích làm đồ án khuya nhưng đeo tai nghe, gọn gàng',
      avatar: '/assets/images/trac-nghiem/avatar-3.jpg',
      contact: {
        phone: '0914 567 823',
        zalo: '0914567823',
        facebook: 'fb.com/ducminh.hust'
      },
      habits: ['Đeo tai nghe sau 23h', 'Không hút thuốc', 'Chia tiền rõ ràng', 'Không nuôi thú cưng']
    },
    costs: {
      electric: '3.500đ / kWh',
      electricNote: 'Đồng hồ điện riêng',
      water: '80.000đ / người / tháng',
      waterNote: 'Nước sạch thành phố',
      service: '60.000đ / người / tháng',
      serviceNote: 'Wifi + thang máy + rác',
      parking: '100.000đ / xe / tháng',
      parkingNote: 'Tầng hầm bảo vệ',
      estimatedTotal: '~ 2.500.000đ - 2.650.000đ'
    },
    description: [
      'Vị trí ngay khu tập thể Bách Khoa – Tạ Quang Bửu, đi bộ sang ĐH Bách khoa HN, ĐH Kinh tế Quốc dân và ĐH Xây dựng.',
      'Phòng rộng 28m² có cửa sổ thoáng, điều hòa, bình nóng lạnh, bàn học đôi và tủ quần áo riêng.'
    ]
  },
  {
    id: '9',
    ownerId: null,
    city: 'Hà Nội',
    title: 'Căn Hộ Mini Ban Công Chùa Láng – Gần Ngoại Thương & Ngoại Giao',
    shortTitle: 'Chùa Láng, Đống Đa',
    breadcrumbTitle: 'Chùa Láng, Đống Đa',
    districtLabel: 'Đống Đa',
    areaKey: 'dong-da',
    address: 'Ngõ 84 Chùa Láng, Phường Láng Thượng, Quận Đống Đa, Hà Nội',
    shortAddress: 'Đống Đa · HN',
    distanceLabel: 'Cách FTU & Học viện Ngoại giao 300m',
    schoolDistanceBadge: 'Cách FTU / DAV 300m',
    price: 2900000,
    priceFormatted: '2.900.000đ',
    totalRoomPrice: '5.800.000đ/tháng',
    areaSqm: 32,
    capacityLabel: 'Tối đa 2 Nữ',
    spotsLabel: 'Còn 1 bạn nữ',
    badgeText: 'Căn hộ mini',
    floorLabel: 'Tầng 5 (Thang máy)',
    depositLabel: '1 tháng cọc',
    typeKey: 'can-ho',
    typeLabel: 'Căn hộ mini',
    matchScore: 90,
    isNewUserPost: false,
    isVerifiedListing: true,
    isBoosted: false,
    amenities: ['Máy lạnh', 'Máy nước nóng', 'Ban công', 'Tủ giày', 'Giờ linh hoạt'],
    summarySpecs: '32m² • Ban công thoáng, gần FTU',
    images: [
      '/assets/images/dang-tin/room-1.jpg',
      '/assets/images/phong-chi-tiet/room-7.jpg'
    ],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'khanh-an',
      name: 'Phạm Khánh An',
      age: '20 tuổi',
      bioTitle: 'Sinh viên Năm 2 • ĐH Ngoại thương (FTU)',
      note: 'Tìm bạn nữ sạch sẽ, thích không gian sáng sủa yên tĩnh',
      avatar: '/assets/images/trac-nghiem/avatar-2.jpg',
      contact: {
        phone: '0918 654 321',
        zalo: '0918654321',
        facebook: 'fb.com/khanhan.ftu'
      },
      habits: ['Ngủ trước 23h30', 'Không hút thuốc', 'Dọn phòng cuối tuần', 'Không qua đêm khách lạ']
    },
    costs: {
      electric: '3.800đ / kWh',
      electricNote: 'Công tơ riêng',
      water: '90.000đ / người / tháng',
      waterNote: 'Nước máy sạch',
      service: '70.000đ / người / tháng',
      serviceNote: 'Wifi + thang máy + vệ sinh',
      parking: '120.000đ / xe / tháng',
      parkingNote: 'Hầm xe khóa từ',
      estimatedTotal: '~ 3.250.000đ'
    },
    description: [
      'Căn hộ mini nằm trong ngõ rộng khu Chùa Láng, chỉ 3 phút đi bộ tới ĐH Ngoại thương và Học viện Ngoại giao.',
      'Có ban công riêng nhiều nắng, tủ giày gỗ, điều hòa, bình nóng lạnh và kệ bếp riêng biệt.'
    ]
  }
];

const SEED_ROOMMATES = [
  {
    id: 'hoang-nam',
    userId: 'user-hoangnam',
    quizProfile: { 1: 'A', 2: 'B', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'A' },
    name: 'Nguyễn Hoàng Nam',
    shortName: 'Hoàng Nam',
    age: 20,
    gender: 'Nam',
    school: 'ĐH Khoa học Tự nhiên CS1 (Q.5)',
    shortSchool: 'HCMUS',
    major: 'Năm 2 · Khoa Công nghệ Thông tin',
    matchScore: 98,
    matchLabel: '98% Cực hợp gu',
    vnuMember: true,
    hasRoom: true,
    roomStatusTitle: 'Đang có phòng sẵn:',
    roomStatusDetail: 'Đường Vành Đai, Linh Trung, Thủ Đức (2.3tr/tháng)',
    linkedRoomId: '1',
    areaKey: 'thu-duc',
    city: 'TP.HCM',
    budget: '2.0 - 2.5 tr/tháng',
    avatar: '/assets/images/trang-chu/avatar-2.jpg',
    quote: '“Mình thích nấu cơm trưa mang theo học, cuối tuần thường đọc sách hoặc dọn dẹp phòng trọ.”',
    criteria: [
      'Ngủ 00h00, học đêm đeo tai nghe',
      'Gọn gàng, tự nấu ăn tối',
      'Không hút thuốc',
      'Điện nước chia đều mùng 5'
    ],
    tags: ['#HọcĐêm', '#KhôngHútThuốc', '#NấuĂnTiếtKiệm'],
    contact: {
      phone: '0901 234 512',
      zalo: '0901234512',
      facebook: 'fb.com/hoangnam.hcmus'
    }
  },
  {
    id: 'minh-anh',
    userId: null,
    quizProfile: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'A' },
    name: 'Lê Minh Anh',
    shortName: 'Minh Anh',
    age: 20,
    gender: 'Nữ',
    school: 'ĐH Khoa học Tự nhiên (HCMUS) · Q.5',
    shortSchool: 'HCMUS',
    major: 'Năm 2 · Công nghệ Sinh học & Truyền thông',
    matchScore: 95,
    matchLabel: '95% Rất hợp gu',
    vnuMember: true,
    hasRoom: false,
    roomStatusTitle: 'Đang tìm bạn:',
    roomStatusDetail: 'Cùng thuê phòng Q.5 hoặc Q.10 (2.0 - 2.5tr)',
    linkedRoomId: '6',
    areaKey: 'quan-5',
    city: 'TP.HCM',
    budget: '2.0 - 2.5 tr/tháng',
    avatar: '/assets/images/trang-chu/avatar-1.jpg',
    quote: '“Rất tôn trọng không gian riêng của roommate, thích chia lịch rửa chén và đi siêu thị chung.”',
    criteria: [
      'Ôn thi nghiêm túc, không ồn ào',
      'Sạch sẽ, thích tự nấu ăn',
      'Không nuôi thú cưng',
      'Hóa đơn chia rạch ròi'
    ],
    tags: ['#ThứcKhuyaHọcBài', '#YênTĩnh', '#NấuĂnNgon'],
    contact: {
      phone: '0902 345 674',
      zalo: '0902345674',
      facebook: 'fb.com/minhanh.hcmus'
    }
  },
  {
    id: 'quoc-bao',
    userId: null,
    quizProfile: { 1: 'A', 2: 'C', 3: 'A', 4: 'B', 5: 'B', 6: 'A', 7: 'B', 8: 'A', 9: 'B' },
    name: 'Trần Quốc Bảo',
    shortName: 'Quốc Bảo',
    age: 21,
    gender: 'Nam',
    school: 'ĐH Bách Khoa ĐHQG CS2 (Làng ĐH)',
    shortSchool: 'HCMUT',
    major: 'Năm 3 · Khoa Kỹ thuật Máy tính',
    matchScore: 92,
    matchLabel: '92% Hòa hợp',
    vnuMember: true,
    hasRoom: true,
    roomStatusTitle: 'Đang có phòng sẵn:',
    roomStatusDetail: 'KTX & Làng ĐHQG CS2 (1.8tr/tháng)',
    linkedRoomId: '1',
    areaKey: 'thu-duc',
    city: 'TP.HCM',
    budget: '1.5 - 2.0 tr/tháng',
    avatar: '/assets/images/trang-chu/avatar-2.jpg',
    quote: '“Học CNTT nên thỉnh thoảng thức khuya làm đồ án, nhưng luôn đeo tai nghe và giữ phòng yên ắng.”',
    criteria: [
      'Ngủ sau 23h30, dậy 07h00',
      'Thích thể thao cuối tuần',
      'Tự giác lau dọn nhà cửa',
      'Không hút thuốc'
    ],
    tags: ['#SạchSẽ', '#DậySớm', '#ĐeoTaiNghe'],
    contact: {
      phone: '0904 221 890',
      zalo: '0904221890',
      facebook: 'fb.com/quocbao.hcmut'
    }
  },
  {
    id: 'thao-vy',
    userId: null,
    quizProfile: { 1: 'B', 2: 'A', 3: 'A', 4: 'C', 5: 'A', 6: 'A', 7: 'D', 8: 'A', 9: 'A' },
    name: 'Vũ Thảo Vy',
    shortName: 'Thảo Vy',
    age: 19,
    gender: 'Nữ',
    school: 'ĐH KHXH&NV TP.HCM (Q.1)',
    shortSchool: 'USSH',
    major: 'Năm 1 · Báo chí & Truyền thông',
    matchScore: 88,
    matchLabel: '88% Hòa hợp',
    vnuMember: true,
    hasRoom: false,
    roomStatusTitle: 'Đang tìm phòng:',
    roomStatusDetail: 'Khu vực Bình Thạnh hoặc gần xe buýt ĐHQG (1.5 - 2.0tr)',
    linkedRoomId: '2',
    areaKey: 'binh-thanh',
    city: 'TP.HCM',
    budget: '1.5 - 2.0 tr/tháng',
    avatar: '/assets/images/trang-chu/avatar-3.jpg',
    quote: '“Hướng nội, thích đọc sách & viết lách, rất tôn trọng đồ cá nhân và giờ giấc văn minh.”',
    criteria: [
      'Hướng nội, thích đọc sách & viết lách',
      'Rất sạch sẽ & tôn trọng đồ cá nhân',
      'Giờ giấc sinh hoạt tự do, văn minh',
      'Không dẫn bạn qua đêm'
    ],
    tags: ['#HướngNội', '#GọnGàng', '#TônTrọngRiêngTư'],
    contact: {
      phone: '0903 456 781',
      zalo: '0903456781',
      facebook: 'fb.com/thaovy.ussh'
    }
  },
  {
    id: 'gia-huy',
    userId: null,
    quizProfile: { 1: 'A', 2: 'C', 3: 'B', 4: 'B', 5: 'B', 6: 'A', 7: 'C', 8: 'B', 9: 'A' },
    name: 'Phạm Gia Huy',
    shortName: 'Gia Huy',
    age: 21,
    gender: 'Nam',
    school: 'ĐH Công nghệ Thông tin (UIT - ĐHQG)',
    shortSchool: 'UIT',
    major: 'Năm 3 · Kỹ thuật Phần mềm',
    matchScore: 87,
    matchLabel: '87% Hòa hợp',
    vnuMember: true,
    hasRoom: true,
    roomStatusTitle: 'Đang có phòng sẵn:',
    roomStatusDetail: 'Khu phố 6 Linh Trung, Thủ Đức (1.8tr/tháng)',
    linkedRoomId: '1',
    areaKey: 'thu-duc',
    city: 'TP.HCM',
    budget: '1.5 - 2.2 tr/tháng',
    avatar: '/assets/images/trang-chu/avatar-2.jpg',
    quote: '“Thường code tối muộn với tai nghe, cuối tuần hay chạy bộ trong Làng ĐHQG.”',
    criteria: [
      'Không hút thuốc, không nhậu phòng',
      'Chia tiền điện nước rõ ràng',
      'Thoải mái nấu ăn cơ bản',
      'Báo trước khi có bạn ghé'
    ],
    tags: ['#UIT', '#ThểThao', '#RạchRòiChiPhí'],
    contact: {
      phone: '0909 554 218',
      zalo: '0909554218',
      facebook: 'fb.com/giahuy.uit'
    }
  },
  {
    id: 'ngoc-han',
    userId: null,
    quizProfile: { 1: 'B', 2: 'A', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'D' },
    name: 'Trịnh Ngọc Hân',
    shortName: 'Ngọc Hân',
    age: 20,
    gender: 'Nữ',
    school: 'ĐH Khoa học Tự nhiên (HCMUS CS1)',
    shortSchool: 'HCMUS',
    major: 'Năm 2 · Hóa học',
    matchScore: 92,
    matchLabel: '92% Rất hợp gu',
    vnuMember: true,
    hasRoom: false,
    roomStatusTitle: 'Đang tìm phòng:',
    roomStatusDetail: 'Gần Nguyễn Văn Cừ Q.5 hoặc Tô Hiến Thành Q.10 (2.0 - 2.6tr)',
    linkedRoomId: '6',
    areaKey: 'quan-5',
    city: 'TP.HCM',
    budget: '2.0 - 2.6 tr/tháng',
    avatar: '/assets/images/trang-chu/avatar-1.jpg',
    quote: '“Tìm 1 bạn nữ KHTN hoặc Y Dược ở ghép cùng chia sẻ tiền trọ lâu dài.”',
    criteria: [
      'Ngủ trước 23h30, dậy sớm đi lab',
      'Dọn phòng 2 lần/tuần',
      'Không nuôi thú cưng',
      'Tôn trọng giờ nghỉ ngơi'
    ],
    tags: ['#HCMUS', '#SạchSẽ', '#ỞLâuDài'],
    contact: {
      phone: '0906 778 902',
      zalo: '0906778902',
      facebook: 'fb.com/ngochan.hcmus'
    }
  },
  {
    id: 'ha-linh',
    userId: null,
    quizProfile: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'A' },
    name: 'Nguyễn Hà Linh',
    shortName: 'Hà Linh',
    age: 20,
    gender: 'Nữ',
    school: 'ĐH Ngoại ngữ - ĐHQGHN (ULIS) · Cầu Giấy',
    shortSchool: 'ULIS',
    major: 'Năm 2 · Ngôn ngữ Anh',
    matchScore: 93,
    matchLabel: '93% Rất hợp gu',
    vnuMember: true,
    hasRoom: true,
    roomStatusTitle: 'Đang có phòng sẵn:',
    roomStatusDetail: 'Ngõ 165 Xuân Thủy, Cầu Giấy, Hà Nội (2.1tr/tháng)',
    linkedRoomId: '7',
    areaKey: 'cau-giay',
    city: 'Hà Nội',
    budget: '2.0 - 2.3 tr/tháng',
    avatar: '/assets/images/trang-chu/avatar-1.jpg',
    quote: '“Mình học sáng nhiều, tối thích yên tĩnh ôn bài và luôn giữ góc bếp sạch sẽ.”',
    criteria: [
      'Ngủ trước 23h30',
      'Không hút thuốc, không thú cưng',
      'Dọn phòng cuối tuần',
      'Ưu tiên sinh viên ĐHQGHN / HNUE'
    ],
    tags: ['#CầuGiấy', '#ULIS', '#SạchSẽ'],
    contact: {
      phone: '0912 348 765',
      zalo: '0912348765',
      facebook: 'fb.com/halinh.ulis'
    }
  },
  {
    id: 'duc-minh',
    userId: null,
    quizProfile: { 1: 'A', 2: 'C', 3: 'A', 4: 'C', 5: 'B', 6: 'A', 7: 'B', 8: 'B', 9: 'A' },
    name: 'Trần Đức Minh',
    shortName: 'Đức Minh',
    age: 21,
    gender: 'Nam',
    school: 'ĐH Bách khoa Hà Nội (HUST) · Hai Bà Trưng',
    shortSchool: 'HUST',
    major: 'Năm 3 · Khoa học Máy tính',
    matchScore: 91,
    matchLabel: '91% Rất hợp gu',
    vnuMember: false,
    hasRoom: true,
    roomStatusTitle: 'Đang có phòng sẵn:',
    roomStatusDetail: 'Ngõ 40 Tạ Quang Bửu, Hai Bà Trưng, Hà Nội (2.2tr/tháng)',
    linkedRoomId: '8',
    areaKey: 'hai-ba-trung',
    city: 'Hà Nội',
    budget: '2.0 - 2.5 tr/tháng',
    avatar: '/assets/images/trang-chu/avatar-2.jpg',
    quote: '“Hay chạy deadline khuya nhưng luôn đeo tai nghe và giữ phòng gọn gàng.”',
    criteria: [
      'Đeo tai nghe sau 23h',
      'Không hút thuốc',
      'Chia điện nước rõ ràng',
      'Đi bộ ra HUST & NEU'
    ],
    tags: ['#HUST', '#HaiBàTrưng', '#ĐeoTaiNghe'],
    contact: {
      phone: '0914 567 823',
      zalo: '0914567823',
      facebook: 'fb.com/ducminh.hust'
    }
  }
];

const QUIZ_QUESTIONS = [
  {
    number: 1,
    pillarIndex: 0,
    pillarName: 'Nhịp sinh học & Giấc ngủ',
    badgeText: 'Phần 1 • Giới tính & Ghép phòng',
    weightText: 'Tiêu chí lọc cứng (Deal-breaker): 100% ưu tiên',
    title: 'Câu hỏi 1: Giới tính của bạn và mong muốn tìm bạn cùng phòng như thế nào?',
    subtitle: 'Giới tính là tiêu chí lọc cứng đầu tiên giúp hệ thống đề xuất danh sách bạn ở ghép phù hợp, thoải mái và an toàn nhất.',
    options: [
      {
        key: 'A',
        title: 'Mình là Nam — Tìm bạn cùng phòng Nam',
        desc: 'Chỉ đề xuất và kết nối với các bạn sinh viên nam đang tìm phòng hoặc tìm người ở ghép.',
        popular: '46%',
        icon: 'male'
      },
      {
        key: 'B',
        title: 'Mình là Nữ — Tìm bạn cùng phòng Nữ',
        desc: 'Chỉ đề xuất và kết nối với các bạn sinh viên nữ để đảm bảo sự riêng tư, thoải mái và an toàn.',
        popular: '48%',
        icon: 'female'
      },
      {
        key: 'C',
        title: 'Mình là Nam — Linh hoạt giới tính',
        desc: 'Ưu tiên bạn cùng phòng nam hoặc căn hộ nhiều phòng ngủ riêng biệt nếu hợp lối sống.',
        icon: 'wc'
      },
      {
        key: 'D',
        title: 'Mình là Nữ — Linh hoạt giới tính',
        desc: 'Ưu tiên bạn cùng phòng nữ hoặc nhóm bạn thuê chung căn hộ / nhà nguyên căn có phòng riêng.',
        icon: 'diversity_3'
      }
    ]
  },
  {
    number: 2,
    pillarIndex: 0,
    pillarName: 'Nhịp sinh học & Giấc ngủ',
    badgeText: 'Phần 1 • Nhịp sinh học',
    weightText: 'Trọng số thuật toán: 20% độ tương thích',
    title: 'Câu hỏi 2: Giờ đi ngủ và thức dậy thường ngày của bạn như thế nào?',
    subtitle: 'Giờ giấc lệch pha là nguyên nhân hàng đầu khiến sinh viên khó ngủ ngon vào mùa ôn thi.',
    options: [
      {
        key: 'A',
        title: 'Ngủ sớm trước 23h00, dậy trước 07h00',
        desc: 'Ưu tiên giấc ngủ đều đặn, thích học buổi sáng sớm và giữ phòng tắt đèn trước 23h.',
        popular: '34%',
        icon: 'wb_sunny'
      },
      {
        key: 'B',
        title: 'Ngủ khoảng 23h30 - 00h30',
        desc: 'Nhịp sinh hoạt cân bằng của đa số sinh viên, cần yên tĩnh nhẹ sau 23h30.',
        popular: '46%',
        icon: 'bedtime'
      },
      {
        key: 'C',
        title: 'Cú đêm làm đồ án / học bài sau 01h00',
        desc: 'Thường thức khuya chạy deadline nhưng sẵn sàng dùng đèn bàn nhỏ và đeo tai nghe.',
        icon: 'nightlight'
      },
      {
        key: 'D',
        title: 'Linh hoạt theo lịch học & làm thêm',
        desc: 'Giờ ngủ thay đổi theo ca làm hoặc lịch thi, ngủ dễ không quá nhạy ánh sáng.',
        icon: 'schedule'
      }
    ]
  },
  {
    number: 3,
    pillarIndex: 0,
    pillarName: 'Nhịp sinh học & Giấc ngủ',
    badgeText: 'Phần 1 • Mức độ tiếng ồn',
    weightText: 'Trọng số thuật toán: 15% độ tương thích',
    title: 'Câu hỏi 3: Khi bạn cùng phòng đang nghỉ ngơi hoặc ôn thi, mức tiếng ồn bạn chấp nhận được?',
    subtitle: 'Giúp thuật toán lọc ra những bạn có cùng thói quen dùng tai nghe, chơi game hoặc học nhóm.',
    options: [
      {
        key: 'A',
        title: 'Yên tĩnh tuyệt đối, luôn đeo tai nghe',
        desc: 'Học bài, xem phim hay gọi điện ban đêm đều đeo tai nghe, không bật loa ngoài.',
        popular: '52%',
        icon: 'headphones'
      },
      {
        key: 'B',
        title: 'Nói chuyện vừa phải trước 22h30',
        desc: 'Thoải mái trao đổi hoặc call bạn bè ban ngày, sau 22h30 giữ yên lặng.',
        icon: 'record_voice_over'
      },
      {
        key: 'C',
        title: 'Thoải mái giao lưu, ít nhạy tiếng ồn',
        desc: 'Có thể mở nhạc nhẹ hoặc chơi game cùng nhóm bạn vào buổi tối.',
        icon: 'music_note'
      },
      {
        key: 'D',
        title: 'Tôn trọng tín hiệu giờ yên tĩnh',
        desc: 'Có thể trao đổi linh hoạt khi nào cần tập trung ôn thi hoặc nghỉ ngơi.',
        icon: 'volume_down'
      }
    ]
  },
  {
    number: 4,
    pillarIndex: 1,
    pillarName: 'Vệ sinh & Nấu nướng',
    badgeText: 'Phần 2 • Thói quen bếp núc',
    weightText: 'Trọng số thuật toán: 10% độ tương thích',
    title: 'Câu hỏi 4: Bạn thường nấu ăn tại phòng hay ăn ngoài?',
    subtitle: 'Ảnh hưởng đến việc chọn phòng có bếp tách biệt, tủ lạnh chung và cách chia tiền gia vị.',
    options: [
      {
        key: 'A',
        title: 'Tự nấu ăn hàng ngày để tiết kiệm',
        desc: 'Nấu cơm trưa mang đi học và nấu bữa tối, ưu tiên phòng có kệ bếp và tủ lạnh.',
        icon: 'soup_kitchen'
      },
      {
        key: 'B',
        title: 'Nấu đơn giản 3-4 bữa/tuần',
        desc: 'Thi thoảng nấu mì, luộc đồ hoặc nấu chung nếu roommate hợp khẩu vị.',
        popular: '41%',
        icon: 'skillet'
      },
      {
        key: 'C',
        title: 'Chủ yếu ăn ngoài / căng tin trường',
        desc: 'Chỉ dùng ấm đun nước hoặc pha cà phê, giữ khu bếp luôn gọn gàng.',
        icon: 'takeout_dining'
      },
      {
        key: 'D',
        title: 'Nấu chung và chia đều tiền đi chợ',
        desc: 'Thích cảm giác sinh hoạt gia đình, luân phiên nấu ăn và rửa bát.',
        icon: 'restaurant'
      }
    ]
  },
  {
    number: 5,
    pillarIndex: 1,
    pillarName: 'Vệ sinh & Nấu nướng',
    badgeText: 'Khảo sát lối sống độc lập',
    weightText: 'Trọng số thuật toán: 25% độ tương thích',
    title: 'Câu hỏi 5: Thói quen dọn dẹp không gian chung và nấu nướng của bạn như thế nào?',
    subtitle: 'Chọn phương án phản ánh đúng nhất sinh hoạt thực tế của bạn khi ở trọ để so sánh thói quen với roommate.',
    options: [
      {
        key: 'A',
        title: 'Ngăn nắp & Dọn dẹp hàng tuần',
        desc: 'Rửa bát ngay sau khi nấu, hút bụi/lau nhà 1-2 lần/tuần, phân chia lịch trực nhật không gian chung rõ ràng.',
        popular: '48%',
        icon: 'cleaning_services'
      },
      {
        key: 'B',
        title: 'Linh hoạt & Tự giác',
        desc: 'Không quá khắt khe lịch cố định, thấy bẩn sẽ dọn, tự giác rửa chén sau ăn và luôn tôn trọng không gian chung.',
        icon: 'balance'
      },
      {
        key: 'C',
        title: 'Chủ yếu ăn ngoài, ít bày bừa',
        desc: 'Thường ăn ở căng tin trường hoặc mua đồ ăn ngoài, phòng ngủ luôn ngăn nắp, hầu như không dùng đến khu bếp trọ.',
        icon: 'takeout_dining'
      },
      {
        key: 'D',
        title: 'Thoải mái, cuối tuần tổng vệ sinh',
        desc: 'Trong tuần bận học ca kíp và đi làm thêm nên gom rác và dành trọn vẹn sáng Chủ nhật cùng bạn dọn dẹp kỹ càng.',
        icon: 'weekend'
      }
    ]
  },
  {
    number: 6,
    pillarIndex: 2,
    pillarName: 'Thú cưng & Tiếp khách',
    badgeText: 'Phần 3 • Hút thuốc & Thú cưng',
    weightText: 'Trọng số thuật toán: 15% độ tương thích',
    title: 'Câu hỏi 6: Quan điểm của bạn về hút thuốc và nuôi thú cưng trong phòng trọ?',
    subtitle: 'Đây là tiêu chí lọc cứng (Deal-breaker) giúp đảm bảo sức khỏe và sự thoải mái lâu dài.',
    options: [
      {
        key: 'A',
        title: 'Không hút thuốc, không thú cưng',
        desc: 'Ưu tiên phòng sạch mùi, không dị ứng lông chó mèo và môi trường lành mạnh.',
        popular: '64%',
        icon: 'smoke_free'
      },
      {
        key: 'B',
        title: 'Không hút thuốc, thích nuôi mèo/chó nhỏ',
        desc: 'Yêu động vật và có thể chọn phòng trọ cho phép nuôi thú cưng sạch sẽ.',
        icon: 'pets'
      },
      {
        key: 'C',
        title: 'Không hút trong phòng (ra ban công)',
        desc: 'Chỉ hút ở khu vực ngoài trời hoặc hoàn toàn không ảnh hưởng bạn cùng phòng.',
        icon: 'balcony'
      },
      {
        key: 'D',
        title: 'Cởi mở nếu thú cưng được giữ vệ sinh tốt',
        desc: 'Không dị ứng lông thú, sẵn sàng ở chung nếu roommate chăm sóc kỹ.',
        icon: 'favorite'
      }
    ]
  },
  {
    number: 7,
    pillarIndex: 2,
    pillarName: 'Thú cưng & Tiếp khách',
    badgeText: 'Phần 3 • Khách & Riêng tư',
    weightText: 'Trọng số thuật toán: 10% độ tương thích',
    title: 'Câu hỏi 7: Quy tắc về việc đưa bạn bè hoặc người thân ghé phòng chơi?',
    subtitle: 'Thống nhất trước giúp cả hai giữ được không gian riêng tư mà vẫn thoải mái khi cần thiết.',
    options: [
      {
        key: 'A',
        title: 'Hạn chế khách, luôn báo trước ít nhất 6 tiếng',
        desc: 'Ưu tiên sự riêng tư cá nhân, không dẫn người lạ ngủ lại qua đêm.',
        popular: '55%',
        icon: 'lock'
      },
      {
        key: 'B',
        title: 'Có thể mời bạn cùng trường học nhóm ban ngày',
        desc: 'Hoan nghênh bạn bè ghé trao đổi bài tập ban ngày, tránh làm phiền buổi tối.',
        icon: 'groups'
      },
      {
        key: 'C',
        title: 'Thoải mái miễn tôn trọng giờ nghỉ',
        desc: 'Chỉ cần báo trước qua Zalo và không gây ảnh hưởng sinh hoạt chung.',
        icon: 'handshake'
      },
      {
        key: 'D',
        title: 'Chỉ tiếp khách cùng giới, không qua đêm',
        desc: 'Giữ nếp sinh hoạt an toàn, rõ ràng theo thỏa thuận hợp đồng ở ghép.',
        icon: 'verified_user'
      }
    ]
  },
  {
    number: 8,
    pillarIndex: 3,
    pillarName: 'Ngân sách & Chia phòng',
    badgeText: 'Phần 4 • Ngân sách & Khu vực',
    weightText: 'Trọng số thuật toán: 10% độ tương thích',
    title: 'Câu hỏi 8: Tổng ngân sách hàng tháng (gồm tiền phòng + điện nước) bạn dự kiến là bao nhiêu?',
    subtitle: 'Roomie luôn tính tổng chi phí thực đóng mỗi tháng để bạn không gặp bất ngờ phí ẩn.',
    options: [
      {
        key: 'A',
        title: 'Dưới 1.800.000đ / tháng',
        desc: 'Phù hợp khu vực Làng ĐHQG Thủ Đức, Gò Vấp hoặc phòng ở ghép 3-4 bạn.',
        icon: 'savings'
      },
      {
        key: 'B',
        title: 'Từ 1.800.000đ - 2.600.000đ / tháng',
        desc: 'Mức phổ biến cho phòng 2 người có máy lạnh, gần ĐHQG, Q.5, Q.10, Bình Thạnh.',
        popular: '51%',
        icon: 'payments'
      },
      {
        key: 'C',
        title: 'Từ 2.600.000đ - 3.500.000đ / tháng',
        desc: 'Căn hộ mini hoặc studio mới, thang máy, full nội thất trung tâm.',
        icon: 'apartment'
      },
      {
        key: 'D',
        title: 'Trên 3.500.000đ / tháng',
        desc: 'Ưu tiên căn hộ dịch vụ cao cấp hoặc phòng riêng tư tuyệt đối.',
        icon: 'workspace_premium'
      }
    ]
  },
  {
    number: 9,
    pillarIndex: 3,
    pillarName: 'Ngân sách & Chia phòng',
    badgeText: 'Phần 4 • Thanh toán & Đồ dùng',
    weightText: 'Trọng số thuật toán: 15% độ tương thích',
    title: 'Câu hỏi 9: Cách bạn muốn chia hóa đơn điện nước và dùng chung đồ đạc trong phòng?',
    subtitle: 'Minh bạch tiền bạc là chìa khóa cho tình bạn cùng phòng bền vững suốt năm học.',
    options: [
      {
        key: 'A',
        title: 'Rạch ròi hóa đơn, chia đều đầu người trước mùng 5',
        desc: 'Dùng chung bảng tính chi phí hàng tháng, đồ cá nhân dùng riêng hoàn toàn.',
        popular: '62%',
        icon: 'receipt_long'
      },
      {
        key: 'B',
        title: 'Chia đều hóa đơn, dùng chung đồ gia dụng lớn',
        desc: 'Tủ lạnh, máy giặt, nồi cơm, gia vị chia sẻ; mỹ phẩm & đồ cá nhân để riêng.',
        icon: 'kitchen'
      },
      {
        key: 'C',
        title: 'Tự do linh hoạt, ưu tiên tin tưởng',
        desc: 'Mỗi tháng tổng hợp 1 lần qua MoMo / chuyển khoản nhanh gọn.',
        icon: 'account_balance_wallet'
      },
      {
        key: 'D',
        title: 'Áp dụng Hợp đồng mẫu Roomie ngay từ đầu',
        desc: 'Ký biên bản thỏa thuận tiền cọc, chia phí và nội quy phòng trước khi dọn vào.',
        icon: 'description'
      }
    ]
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Hoàng Nam (HCMUS) vừa gửi lời mời kết nối với bạn',
    time: '5 phút trước',
    unread: true,
    href: '/roomie/tim-roommate'
  },
  {
    id: 'n2',
    title: 'Phòng Studio Đường Vành Đai ĐHQG giảm còn 2.300.000đ/tháng',
    time: '1 giờ trước',
    unread: true,
    href: '/roomie/phong-chi-tiet?id=1'
  },
  {
    id: 'n3',
    title: 'Tài khoản HCMUS của bạn đã được xác thực thẻ sinh viên',
    time: 'Hôm qua',
    unread: false,
    href: '/roomie/ve-chung-toi'
  }
];

const PRICING_PACKAGES = [
  {
    id: 'basic',
    name: 'Gói Cơ bản',
    price: '0đ',
    studentPrice: '0đ',
    period: '/ vĩnh viễn',
    available: true,
    desc: 'Đăng tối đa 01 tin tìm roommate mỗi ngày miễn phí.'
  },
  {
    id: 'extra-posts-day',
    name: 'Thêm 3 tin trong ngày',
    price: '49.000đ',
    studentPrice: '49.000đ',
    priceVnd: 49000,
    period: '/ ngày',
    durationMs: 24 * 60 * 60 * 1000,
    available: true,
    desc: 'Thêm tối đa 03 lượt đăng trong ngày, tổng cộng tối đa 04 tin/ngày.'
  },
  {
    id: 'boost-24h',
    name: 'Đẩy tin 24 giờ',
    price: '19.000đ',
    studentPrice: '19.000đ',
    priceVnd: 19000,
    period: '/ 24 giờ',
    durationMs: 24 * 60 * 60 * 1000,
    available: true,
    desc: 'Đưa một bài đăng bạn chọn lên đầu danh sách trong 24 giờ.'
  },
  {
    id: 'boost-7d',
    name: 'Đẩy tin 7 ngày',
    price: '69.000đ',
    studentPrice: '69.000đ',
    priceVnd: 69000,
    period: '/ 7 ngày',
    durationMs: 7 * 24 * 60 * 60 * 1000,
    available: true,
    desc: 'Đưa một bài đăng bạn chọn lên đầu danh sách trong 07 ngày.'
  },
  {
    id: 'unlimited-matches-day',
    name: 'Match không giới hạn',
    price: '35.000đ',
    studentPrice: '35.000đ',
    priceVnd: 35000,
    period: '/ ngày',
    durationMs: 24 * 60 * 60 * 1000,
    available: true,
    desc: 'Không giới hạn lượt xem kết quả ghép roommate trong ngày.'
  },
  {
    id: 'all-in-one',
    name: 'Gói trọn bộ',
    price: '149.000đ',
    studentPrice: '149.000đ',
    priceVnd: 149000,
    period: '/ 30 ngày',
    durationMs: 30 * 24 * 60 * 60 * 1000,
    available: true,
    desc: 'Gồm toàn bộ quyền lợi của gói 1–4 trong thời hạn 30 ngày.'
  }
];

module.exports = {
  SEED_USERS,
  SEED_ROOMS,
  SEED_ROOMMATES,
  QUIZ_QUESTIONS,
  SEED_NOTIFICATIONS,
  PRICING_PACKAGES
};
