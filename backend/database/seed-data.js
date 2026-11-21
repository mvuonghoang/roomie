/**
 * Roomie Match - Canonical Seed Dataset for Backend & Database
 * Đồng bộ 100% với dữ liệu mẫu trên Frontend (src/scripts/data.js & core.js)
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
  }
];

const SEED_ROOMS = [
  {
    id: '1',
    ownerId: 'user-hoangnam',
    title: 'Phòng Studio Ban Công Thoáng Mát – Đối Diện KTX Khu B ĐHQG',
    shortTitle: 'KTX & Làng Đại học Thủ Đức',
    breadcrumbTitle: 'KTX & Phòng trọ Làng Đại học CS2',
    districtLabel: 'TP. Thủ Đức',
    areaKey: 'thu-duc',
    city: 'TP.HCM',
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
    amenities: ['Máy lạnh', 'Máy giặt', 'Giờ linh hoạt', 'Ban công'],
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
    title: 'Phòng Share Rộng Rãi Điện Biên Phủ – Gần HUTECH & UEF',
    shortTitle: 'Điện Biên Phủ, P.25 Bình Thạnh',
    breadcrumbTitle: 'Điện Biên Phủ, P.25 Bình Thạnh',
    districtLabel: 'Bình Thạnh',
    areaKey: 'binh-thanh',
    city: 'TP.HCM',
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
    images: ['/assets/images/trang-chu/room-2.jpg', '/assets/images/tim-phong/room-2.jpg'],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'thao-vy',
      name: 'Thảo Vy',
      age: '19 tuổi',
      bioTitle: 'Sinh viên Năm 1 • ĐH KHXH&NV & HUTECH, Bình Thạnh',
      note: 'Tìm bạn nữ sạch sẽ, ưu tiên học tập yên tĩnh, nấu ăn nhẹ',
      avatar: '/assets/images/trang-chu/avatar-3.jpg',
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
    ownerId: 'user-minhthu',
    title: 'Phòng Trọ Cao Cấp Full Nội Thất – Đối Diện HCMUS CS1',
    shortTitle: 'Phòng trọ cao cấp Full nội thất',
    breadcrumbTitle: 'Nguyễn Văn Cừ, Quận 5',
    districtLabel: 'Quận 5',
    areaKey: 'quan-5',
    city: 'TP.HCM',
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
    isBoosted: true,
    amenities: ['Máy lạnh', 'Giờ linh hoạt', 'Khu vực để xe'],
    summarySpecs: '25m² • Nguyên phòng, camera an ninh',
    images: ['/assets/images/trang-chu/room-3.jpg', '/assets/images/tim-phong/room-3.jpg'],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'minh-anh',
      name: 'Lê Minh Anh',
      age: '20 tuổi',
      bioTitle: 'Sinh viên Năm 2 • ĐH Khoa học Tự nhiên (HCMUS)',
      note: 'Thích thức khuya học bài đeo tai nghe, cần phòng cực kỳ yên tĩnh',
      avatar: '/assets/images/trang-chu/avatar-1.jpg',
      contact: {
        phone: '0902 345 674',
        zalo: '0902345674',
        facebook: 'fb.com/minhanh.ueh'
      },
      habits: ['Thức khuya học bài', 'Không hút thuốc', 'Yên tĩnh tuyệt đối', 'Sạch sẽ']
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
      'Phòng có gác gỗ ấm cúng, đầy đủ bàn học, tủ đồ, máy lạnh, cửa khóa thẻ từ an toàn tuyệt đối. Gần Nowzone, siêu thị và hàng quán sinh viên.'
    ]
  },
  {
    id: '4',
    ownerId: 'user-hoangnam',
    title: 'Nhà Nguyên Căn Share Phòng – Quang Trung, Gò Vấp',
    shortTitle: 'Nhà nguyên căn share phòng',
    breadcrumbTitle: 'Quang Trung, Gò Vấp',
    districtLabel: 'Gò Vấp',
    areaKey: 'go-vap',
    city: 'TP.HCM',
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
    amenities: ['Máy lạnh', 'Máy giặt', 'Giờ linh hoạt', 'Khu vực để xe'],
    summarySpecs: '30m² • Nấu ăn thoải mái, xe free',
    images: ['/assets/images/trang-chu/room-4.jpg', '/assets/images/tim-phong/room-4.jpg'],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'quoc-bao',
      name: 'Quốc Bảo',
      age: '21 tuổi',
      bioTitle: 'Sinh viên Năm 3 • ĐH Bách Khoa & Công Nghiệp',
      note: 'Thoải mái nấu ăn chung, giữ nhà để xe gọn gàng',
      avatar: '/assets/images/trang-chu/avatar-2.jpg',
      contact: {
        phone: '0908 112 345',
        zalo: '0908112345',
        facebook: 'fb.com/quocbao.hcmut'
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
    ownerId: 'user-minhthu',
    title: 'Căn Hộ Ban Công Nguyễn Gia Trí (D2) – Bình Thạnh',
    shortTitle: 'Căn hộ ban công Nguyễn Gia Trí',
    breadcrumbTitle: 'Nguyễn Gia Trí, Bình Thạnh',
    districtLabel: 'Bình Thạnh',
    areaKey: 'binh-thanh',
    city: 'TP.HCM',
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
    amenities: ['Máy lạnh', 'Máy giặt', 'Giờ linh hoạt'],
    summarySpecs: '28m² • Còn 1 bạn nữ',
    images: ['/assets/images/tim-phong/room-2.jpg'],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'minh-anh',
      name: 'Minh Anh',
      age: '20 tuổi',
      bioTitle: 'Sinh viên Năm 2 • ĐH Khoa học Tự nhiên (HCMUS)',
      note: 'Ưu tiên bạn nữ gọn gàng, không dắt người lạ qua đêm',
      avatar: '/assets/images/trang-chu/avatar-1.jpg',
      contact: {
        phone: '0902 345 674',
        zalo: '0902345674',
        facebook: 'fb.com/minhanh.ftu2'
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
    ownerId: 'user-minhthu',
    title: 'Studio Duplex Tô Hiến Thành – Quận 10',
    shortTitle: 'Studio duplex Tô Hiến Thành',
    breadcrumbTitle: 'Tô Hiến Thành, Quận 10',
    districtLabel: 'Quận 10',
    areaKey: 'quan-10',
    city: 'TP.HCM',
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
    amenities: ['Máy lạnh', 'Máy giặt', 'Giờ linh hoạt', 'Khu vực để xe'],
    summarySpecs: '35m² • Còn 1 bạn nữ',
    images: ['/assets/images/tim-phong/room-5.jpg'],
    mapBg: '/assets/images/phong-chi-tiet/map-1.png',
    roommate: {
      id: 'minh-anh',
      name: 'Lê Minh Anh',
      age: '20 tuổi',
      bioTitle: 'Sinh viên Năm 2 • ĐH Khoa học Tự nhiên (HCMUS)',
      note: 'Ở sạch sẽ, phân chia lịch vệ sinh rõ ràng',
      avatar: '/assets/images/trang-chu/avatar-1.jpg',
      contact: {
        phone: '0902 345 674',
        zalo: '0902345674',
        facebook: 'fb.com/minhanh.ueh'
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
  }
];

const SEED_ROOMMATES = [
  {
    id: 'hoang-nam',
    userId: 'user-hoangnam',
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
    roomStatusDetail: 'Hẻm 48 Đặng Văn Bi, Thủ Đức (2.3tr/tháng)',
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
    },
    quizProfile: { 1: 'A', 2: 'B', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'A' }
  },
  {
    id: 'minh-anh',
    userId: null,
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
    },
    quizProfile: { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'A' }
  },
  {
    id: 'quoc-bao',
    userId: null,
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
      phone: '0908 112 345',
      zalo: '0908112345',
      facebook: 'fb.com/quocbao.hcmut'
    },
    quizProfile: { 1: 'A', 2: 'C', 3: 'A', 4: 'B', 5: 'B', 6: 'A', 7: 'B', 8: 'A', 9: 'B' }
  },
  {
    id: 'thao-vy',
    userId: null,
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
    },
    quizProfile: { 1: 'B', 2: 'A', 3: 'A', 4: 'C', 5: 'A', 6: 'A', 7: 'D', 8: 'A', 9: 'A' }
  },
  {
    id: 'gia-huy',
    userId: null,
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
    },
    quizProfile: { 1: 'A', 2: 'C', 3: 'B', 4: 'B', 5: 'B', 6: 'A', 7: 'C', 8: 'B', 9: 'A' }
  },
  {
    id: 'ngoc-han',
    userId: null,
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
    linkedRoomId: '3',
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
    },
    quizProfile: { 1: 'B', 2: 'A', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A', 8: 'B', 9: 'D' }
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Hoàng Nam (98% Hợp gu) vừa xem hồ sơ của bạn',
    time: '5 phút trước',
    unread: true,
    href: '/roomie/tim-roommate'
  },
  {
    id: 'n2',
    title: 'Phòng Studio Đặng Văn Bi giảm còn 2.300.000đ/tháng',
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
    desc: 'Đăng 01 tin tìm phòng hoặc ở ghép, xem tối đa 5 hồ sơ/ngày và gửi lời mời kết nối 2 chiều miễn phí.'
  },
  {
    id: 'boost',
    name: 'Boost Listing',
    price: '5.000đ',
    studentPrice: '4.000đ',
    period: '/ ngày',
    desc: "Ưu tiên hiển thị đầu trang tìm kiếm, gắn nhãn 'Cần gấp' nổi bật và tiếp cận gấp 5 lần lượt xem."
  },
  {
    id: 'match-plus',
    name: 'Match Plus',
    price: '9.000đ',
    studentPrice: '7.000đ',
    period: '/ lượt match',
    desc: 'Mở khóa dự đoán gợi ý bạn cùng phòng real-time, đối chiếu thói quen ngủ, học & lọc cùng trường đại học.'
  },
  {
    id: 'verified-pro',
    name: 'Sinh viên Pro',
    price: '15.000đ',
    studentPrice: '12.000đ',
    period: '/ 6 tháng',
    desc: 'Cấp huy hiệu tích xanh Đã xác thực SV, tăng đến 90% tỉ lệ đồng ý kết nối 2 chiều.'
  },
  {
    id: 'combo',
    name: 'Combo Thần Tốc',
    price: '29.000đ',
    studentPrice: '23.000đ',
    period: '/ tuần',
    desc: 'Tặng 3 lượt Boost Listing đầu trang, mở khóa không giới hạn Match Plus & dự đoán gợi ý roommate.'
  },
  {
    id: 'host',
    name: 'Chủ trọ & Nhượng',
    price: '49.000đ',
    studentPrice: '39.000đ',
    period: '/ tháng',
    desc: 'Đăng không giới hạn ảnh & video thực tế, hiển thị SĐT & Zalo trực tiếp, ghim top 30 ngày.'
  }
];

module.exports = {
  SEED_USERS,
  SEED_ROOMS,
  SEED_ROOMMATES,
  SEED_NOTIFICATIONS,
  PRICING_PACKAGES
};
