// Roomie Shared Dataset
// Ban co the chinh sua thong tin phong tro, ho so roommate, cau hoi trac nghiem va bang gia tai day.

window.RoomieData = {
  LOGO_URL: "/assets/images/common/logo.png",
  FOOTER_LOGO_URL: "/assets/images/common/logo.png",
  USER_PROFILE: {
    name: "Minh Thư",
    shortSchool: "HCMUS",
    school: "ĐH Khoa học Tự nhiên (HCMUS)",
    major: "Khoa CNTT • K22",
    idCode: "#SV-8924",
    email: "22120***@student.hcmus.edu.vn",
    avatar:
      "/assets/images/common/avatar-profile.jpg",
    budgetRange: "1.8 - 2.5 tr/tháng",
    preferredAreas: "Làng ĐHQG / Quận 5",
    moveInTime: "Đầu tháng tới"
  },

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
    "tim-roommate": "/roomie/tim-roommate",
    "ket-qua-match": "/roomie/tim-roommate",
    "trac-nghiem-tinh-cach": "/roomie/trac-nghiem",
    "trac-nghiem-hop-gu": "/roomie/trac-nghiem",
    "dang-tin": "/roomie/dang-tin",
    "dang-tin-mien-phi": "/roomie/dang-tin",
    "dich-vu": "/roomie/bang-gia",
    "bang-gia": "/roomie/bang-gia",
    "ve-chung-toi": "/roomie/ve-chung-toi",
    "nguyen-tac-an-toan": "/roomie/an-toan#nguyen-tac",
    "bao-cao-tin-gia": "/roomie/an-toan#bao-cao",
    "lien-he-faq": "/roomie/an-toan#faq",
    "quy-chuan-cong-dong": "/roomie/an-toan#quy-chuan"
  },

  ROOMS: [
    {
      id: "1",
      title: "Phòng Studio Ban Công Thoáng Mát – Đối Diện KTX Khu B ĐHQG",
      shortTitle: "KTX & Làng Đại học Thủ Đức",
      breadcrumbTitle: "KTX & Phòng trọ Làng Đại học CS2",
      districtLabel: "TP. Thủ Đức",
      areaKey: "thu-duc",
      address: "Đường Vành Đai, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh (Cạnh trạm buýt KTX Khu B)",
      shortAddress: "Thủ Đức · KTX B",
      distanceLabel: "Cách ĐH KHTN CS2 500m",
      schoolDistanceBadge: "Cách ĐH Bách Khoa CS2 500m",
      price: 2300000,
      priceFormatted: "2.300.000đ",
      totalRoomPrice: "4.600.000đ/tháng",
      areaSqm: 32,
      capacityLabel: "Tối đa 2 Nam",
      spotsLabel: "Còn 1 chỗ ở ghép nam",
      badgeText: "Trống 1 giường",
      floorLabel: "Tầng 3 (Thang máy)",
      depositLabel: "1 tháng cọc",
      typeKey: "o-ghep",
      typeLabel: "Ở ghép",
      matchScore: 94,
      amenities: ["Máy lạnh", "Máy giặt", "Giờ linh hoạt", "Ban công"],
      summarySpecs: "32m² • Máy lạnh, ban công, giờ tự do",
      images: [
        "/assets/images/phong-chi-tiet/room-1.jpg",
        "/assets/images/phong-chi-tiet/room-2.jpg",
        "/assets/images/phong-chi-tiet/room-3.jpg",
        "/assets/images/phong-chi-tiet/room-4.jpg"
      ],
      mapBg:
        "/assets/images/phong-chi-tiet/map-1.png",
      roommate: {
        id: "hoang-nam",
        name: "Hoàng Nam",
        age: "20 tuổi",
        bioTitle: "Sinh viên Năm 2 • Khoa CNTT, ĐH Khoa học Tự nhiên TP.HCM (HCMUS)",
        note: "Tìm bạn cùng phòng tính tình hòa nhã, tôn trọng giờ giấc",
        avatar:
          "/assets/images/phong-chi-tiet/avatar-1.jpg",
        habits: [
          "Ngủ trước 23h30",
          "Không hút thuốc",
          "Giữ trật tự giờ ôn thi",
          "Thích tự nấu ăn",
          "Không nuôi thú cưng",
          "Dọn phòng luân phiên 2 lần/tuần"
        ]
      },
      costs: {
        electric: "3.500đ / kWh",
        electricNote: "Đồng hồ điện riêng trước cửa phòng",
        water: "50.000đ / người / tháng",
        waterNote: "Nước máy thủy cục sạch",
        service: "50.000đ / người / tháng",
        serviceNote: "(100.000đ / phòng)",
        parking: "Miễn phí",
        parkingNote: "Tối đa 1 xe/người trong hầm",
        estimatedTotal: "~ 2.500.000đ - 2.650.000đ"
      },
      description: [
        "Phòng nằm ở tầng 3 tòa nhà 5 tầng mới xây, cách KTX Khu B ĐHQG chỉ 100m. Có thang máy hiện đại, camera an ninh 24/7 và hệ thống khóa vân tay riêng từng tầng nên cực kỳ an tâm cho sinh viên.",
        "Phòng có ban công riêng cực thoáng mát đón gió tự nhiên, view nhìn ra hàng cây xanh của khuôn viên Làng Đại học, không bị khuất nắng. Đã trang bị sẵn giường đôi tầng trên/dưới loại cao cấp chịu lực, 2 bàn học gỗ có giá sách, tủ quần áo riêng 2 buồng, máy lạnh Inverter tiết kiệm điện.",
        "Hiện bạn Nam (SV KHTN) đang ở giường dưới, cần tìm thêm 1 bạn nam gọn gàng vào ở giường trên để san sẻ chi phí tiền phòng. Chủ nhà thân thiện, không ở chung, giờ giấc hoàn toàn tự do."
      ]
    },
    {
      id: "2",
      title: "Phòng Share Rộng Rãi Điện Biên Phủ – Gần HUTECH & UEF",
      shortTitle: "Điện Biên Phủ, P.25 Bình Thạnh",
      breadcrumbTitle: "Điện Biên Phủ, P.25 Bình Thạnh",
      districtLabel: "Bình Thạnh",
      areaKey: "binh-thanh",
      address: "Hẻm 214 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM (Cách ngã tư Hàng Xanh 300m)",
      shortAddress: "Bình Thạnh",
      distanceLabel: "Gần HUTECH & UEF (Bình Thạnh)",
      schoolDistanceBadge: "Cách HUTECH 400m",
      price: 1800000,
      priceFormatted: "1.800.000đ",
      totalRoomPrice: "5.400.000đ/tháng (chia 3)",
      areaSqm: 35,
      capacityLabel: "Tối đa 3 bạn",
      spotsLabel: "Còn 2 chỗ ở ghép",
      badgeText: "Còn 2 chỗ",
      floorLabel: "Tầng 2 (Có hầm xe)",
      depositLabel: "1 tháng cọc",
      typeKey: "o-ghep",
      typeLabel: "Ở ghép",
      matchScore: 91,
      amenities: ["Máy lạnh", "Máy giặt", "Giờ linh hoạt", "Khu vực để xe"],
      summarySpecs: "35m² • WC riêng, tủ lạnh, máy giặt",
      images: [
        "/assets/images/trang-chu/room-2.jpg",
        "/assets/images/tim-phong/room-2.jpg"
      ],
      mapBg:
        "/assets/images/phong-chi-tiet/map-1.png",
      roommate: {
        id: "thao-vy",
        name: "Thảo Vy",
        age: "19 tuổi",
        bioTitle: "Sinh viên Năm 1 • ĐH KHXH&NV & HUTECH, Bình Thạnh",
        note: "Tìm bạn nữ sạch sẽ, ưu tiên học tập yên tĩnh, nấu ăn nhẹ",
        avatar:
          "/assets/images/trang-chu/avatar-3.jpg",
        habits: ["Ngủ trước 23h30", "Không hút thuốc", "Sạch sẽ gọn gàng", "Tôn trọng riêng tư"]
      },
      costs: {
        electric: "3.500đ / kWh",
        electricNote: "Chia đều theo đầu người cuối tháng",
        water: "80.000đ / người / tháng",
        waterNote: "Nước máy không giới hạn",
        service: "40.000đ / người / tháng",
        serviceNote: "Wifi cáp quang + rác",
        parking: "100.000đ / xe / tháng",
        parkingNote: "Nhà xe khóa từ trong nhà",
        estimatedTotal: "~ 2.050.000đ - 2.200.000đ"
      },
      description: [
        "Phòng rộng 35m² tại khu dân cư văn minh ngay sát ĐH HUTECH và UEF, đi bộ ra trạm xe buýt và Landmark 81 chỉ 5 phút.",
        "Có sẵn WC riêng sạch sẽ, tủ lạnh 180L, máy giặt riêng trên sân phơi thoáng, cửa sổ lớn đón ánh sáng tự nhiên cả ngày.",
        "Phòng rất phù hợp cho nhóm bạn hoặc sinh viên mới lên TP.HCM muốn tiết kiệm chi phí mà vẫn có không gian sinh hoạt thoải mái."
      ]
    },
    {
      id: "3",
      title: "Phòng Trọ Cao Cấp Full Nội Thất – Đối Diện HCMUS CS1",
      shortTitle: "Phòng trọ cao cấp Full nội thất",
      breadcrumbTitle: "Nguyễn Văn Cừ, Quận 5",
      districtLabel: "Quận 5",
      areaKey: "quan-5",
      address: "227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM (Đối diện cổng ĐH Khoa học Tự nhiên CS1)",
      shortAddress: "Quận 5 · Gần KHTN",
      distanceLabel: "Nguyễn Văn Cừ, Quận 5",
      schoolDistanceBadge: "Đối diện HCMUS CS1 (50m)",
      price: 5000000,
      priceFormatted: "5.000.000đ",
      totalRoomPrice: "5.000.000đ/tháng",
      areaSqm: 25,
      capacityLabel: "Nguyên phòng (tối đa 2 người)",
      spotsLabel: "Nguyên phòng riêng",
      badgeText: "Nguyên phòng",
      floorLabel: "Tầng 4 (Thang máy)",
      depositLabel: "1 tháng cọc",
      typeKey: "phong-rieng",
      typeLabel: "Phòng riêng",
      matchScore: 95,
      amenities: ["Máy lạnh", "Giờ linh hoạt", "Khu vực để xe"],
      summarySpecs: "25m² • Nguyên phòng, camera an ninh",
      images: [
        "/assets/images/trang-chu/room-3.jpg",
        "/assets/images/tim-phong/room-3.jpg"
      ],
      mapBg:
        "/assets/images/phong-chi-tiet/map-1.png",
      roommate: {
        id: "minh-anh",
        name: "Lê Minh Anh",
        age: "20 tuổi",
        bioTitle: "Sinh viên Năm 2 • ĐH Khoa học Tự nhiên & UEH",
        note: "Thích thức khuya học bài đeo tai nghe, cần phòng cực kỳ yên tĩnh",
        avatar:
          "/assets/images/trang-chu/avatar-1.jpg",
        habits: ["Thức khuya học bài", "Không hút thuốc", "Yên tĩnh tuyệt đối", "Sạch sẽ"]
      },
      costs: {
        electric: "3.800đ / kWh",
        electricNote: "Công tơ riêng chuẩn nhà nước",
        water: "70.000đ / người / tháng",
        waterNote: "Nước máy sạch",
        service: "Miễn phí",
        serviceNote: "Đã bao gồm Wifi + vệ sinh hành lang",
        parking: "120.000đ / xe / tháng",
        parkingNote: "Thẻ từ bảo vệ 24/24",
        estimatedTotal: "~ 5.300.000đ - 5.500.000đ"
      },
      description: [
        "Vị trí vàng ngay khu trung tâm Quận 5 — chỉ cần băng qua đường là tới giảng đường ĐH Khoa học Tự nhiên CS1, ĐH Sư phạm TP.HCM và ĐH Sài Gòn.",
        "Phòng có gác gỗ ấm cúng, đầy đủ bàn học, tủ đồ, máy lạnh, cửa khóa thẻ từ an toàn tuyệt đối. Gần Nowzone, siêu thị và hàng quán sinh viên."
      ]
    },
    {
      id: "4",
      title: "Nhà Nguyên Căn Share Phòng – Quang Trung, Gò Vấp",
      shortTitle: "Nhà nguyên căn share phòng",
      breadcrumbTitle: "Quang Trung, Gò Vấp",
      districtLabel: "Gò Vấp",
      areaKey: "go-vap",
      address: "Hẻm 350 Quang Trung, Phường 10, Gò Vấp, TP.HCM (Gần ĐH Công Nghiệp IUH)",
      shortAddress: "Gò Vấp",
      distanceLabel: "Quang Trung, Gò Vấp",
      schoolDistanceBadge: "Cách ĐH Công Nghiệp IUH 700m",
      price: 1600000,
      priceFormatted: "1.600.000đ",
      totalRoomPrice: "3.200.000đ/tháng",
      areaSqm: 30,
      capacityLabel: "Tối đa 2 người",
      spotsLabel: "Còn 1 chỗ giá tốt",
      badgeText: "Giá tốt",
      floorLabel: "Lầu 1 (Nhà nguyên căn)",
      depositLabel: "1 tháng cọc",
      typeKey: "o-ghep",
      typeLabel: "Ở ghép",
      matchScore: 88,
      amenities: ["Máy lạnh", "Máy giặt", "Giờ linh hoạt", "Khu vực để xe"],
      summarySpecs: "30m² • Nấu ăn thoải mái, xe free",
      images: [
        "/assets/images/trang-chu/room-4.jpg",
        "/assets/images/tim-phong/room-4.jpg"
      ],
      mapBg:
        "/assets/images/phong-chi-tiet/map-1.png",
      roommate: {
        id: "quoc-bao",
        name: "Quốc Bảo",
        age: "21 tuổi",
        bioTitle: "Sinh viên Năm 3 • ĐH Bách Khoa & Công Nghiệp",
        note: "Thoải mái nấu ăn chung, giữ nhà để xe gọn gàng",
        avatar:
          "/assets/images/trang-chu/avatar-2.jpg",
        habits: ["Sạch sẽ", "Dậy sớm", "Nấu ăn chung", "Không hút thuốc"]
      },
      costs: {
        electric: "Giá nhà nước (~2.800đ/kWh)",
        electricNote: "Chia đều theo hóa đơn điện lực",
        water: "35.000đ / người / tháng",
        waterNote: "Hóa đơn nhà nước",
        service: "50.000đ / người / tháng",
        serviceNote: "Wifi tốc độ cao + rác",
        parking: "Miễn phí",
        parkingNote: "Tầng trệt để được 6 xe máy",
        estimatedTotal: "~ 1.800.000đ - 1.950.000đ"
      },
      description: [
        "Nhà nguyên căn 2 lầu hẻm xe hơi yên tĩnh, có bếp riêng rộng rãi tầng trệt cho sinh viên tự nấu ăn tiết kiệm chi phí.",
        "Giá điện nước tính theo hóa đơn nhà nước siêu rẻ, không thu thêm phí giữ xe."
      ]
    },
    {
      id: "5",
      title: "Căn Hộ Ban Công Nguyễn Gia Trí (D2) – Bình Thạnh",
      shortTitle: "Căn hộ ban công Nguyễn Gia Trí",
      breadcrumbTitle: "Nguyễn Gia Trí, Bình Thạnh",
      districtLabel: "Bình Thạnh",
      areaKey: "binh-thanh",
      address: "Đường Nguyễn Gia Trí (D2 cũ), Phường 25, Bình Thạnh, TP.HCM",
      shortAddress: "Bình Thạnh",
      distanceLabel: "Gần FTU2, HUTECH, GTVT",
      schoolDistanceBadge: "Cách FTU2 / HUTECH 350m",
      price: 2400000,
      priceFormatted: "2.400.000đ",
      totalRoomPrice: "4.800.000đ/tháng",
      areaSqm: 28,
      capacityLabel: "Tối đa 2 Nữ",
      spotsLabel: "Còn 1 bạn nữ",
      badgeText: "Căn hộ mini",
      floorLabel: "Tầng 3 (Thang máy)",
      depositLabel: "1 tháng cọc",
      typeKey: "can-ho",
      typeLabel: "Căn hộ mini",
      matchScore: 93,
      amenities: ["Máy lạnh", "Máy giặt", "Giờ linh hoạt"],
      summarySpecs: "28m² • Còn 1 bạn nữ",
      images: [
        "/assets/images/tim-phong/room-2.jpg"
      ],
      mapBg:
        "/assets/images/phong-chi-tiet/map-1.png",
      roommate: {
        id: "minh-anh",
        name: "Minh Anh",
        age: "20 tuổi",
        bioTitle: "Sinh viên Năm 2 • Ngoại Thương (FTU2)",
        note: "Ưu tiên bạn nữ gọn gàng, không dắt người lạ qua đêm",
        avatar:
          "/assets/images/tim-roommate/avatar-2.jpg",
        habits: ["Sạch sẽ", "Thích nấu ăn", "Không hút thuốc", "Giữ trật tự"]
      },
      costs: {
        electric: "3.500đ / kWh",
        electricNote: "Đồng hồ điện riêng",
        water: "100.000đ / người / tháng",
        waterNote: "Nước máy sạch",
        service: "50.000đ / người / tháng",
        serviceNote: "Wifi + thang máy + vệ sinh",
        parking: "100.000đ / xe / tháng",
        parkingNote: "Hầm xe bảo vệ",
        estimatedTotal: "~ 2.700.000đ - 2.850.000đ"
      },
      description: [
        "Căn hộ mini ngay trung tâm trục đường D2 sầm uất, cực tiện đi học FTU2, HUTECH, GTVT và UEF.",
        "Có ban công phơi đồ thoáng, nội thất gỗ hiện đại, bảo vệ trực 24/7."
      ]
    },
    {
      id: "6",
      title: "Studio Duplex Tô Hiến Thành – Quận 10",
      shortTitle: "Studio duplex Tô Hiến Thành",
      breadcrumbTitle: "Tô Hiến Thành, Quận 10",
      districtLabel: "Quận 10",
      areaKey: "quan-10",
      address: "Đường Tô Hiến Thành, Phường 14, Quận 10, TP.HCM (Sát ĐH Bách Khoa CS1)",
      shortAddress: "Quận 10",
      distanceLabel: "Gần ĐH Bách Khoa CS1 (Q.10)",
      schoolDistanceBadge: "Cách HCMUT CS1 300m",
      price: 2800000,
      priceFormatted: "2.800.000đ",
      totalRoomPrice: "5.600.000đ/tháng",
      areaSqm: 35,
      capacityLabel: "Tối đa 2 Nữ",
      spotsLabel: "Còn 1 bạn nữ",
      badgeText: "Duplex",
      floorLabel: "Tầng 5 (Thang máy)",
      depositLabel: "1 tháng cọc",
      typeKey: "can-ho",
      typeLabel: "Duplex",
      matchScore: 94,
      amenities: ["Máy lạnh", "Máy giặt", "Giờ linh hoạt", "Khu vực để xe"],
      summarySpecs: "35m² • Còn 1 bạn nữ",
      images: [
        "/assets/images/tim-phong/room-5.jpg"
      ],
      mapBg:
        "/assets/images/phong-chi-tiet/map-1.png",
      roommate: {
        id: "minh-anh",
        name: "Lê Minh Anh",
        age: "20 tuổi",
        bioTitle: "Sinh viên Năm 2 • ĐH Kinh Tế UEH (Q.10)",
        note: "Ở sạch sẽ, phân chia lịch vệ sinh rõ ràng",
        avatar:
          "/assets/images/tim-roommate/avatar-2.jpg",
        habits: ["Ngủ sau 23h", "Yên tĩnh ôn thi", "Không thú cưng", "Rạch ròi hóa đơn"]
      },
      costs: {
        electric: "3.800đ / kWh",
        electricNote: "Đồng hồ điện riêng",
        water: "80.000đ / người / tháng",
        waterNote: "Nước thủy cục",
        service: "70.000đ / người / tháng",
        serviceNote: "Wifi + thang máy + rác",
        parking: "120.000đ / xe / tháng",
        parkingNote: "Hầm xe bảo vệ 24/7",
        estimatedTotal: "~ 3.100.000đ"
      },
      description: [
        "Studio thiết kế gác duplex cao trần thoáng đãng ngay mặt hẻm lớn Tô Hiến Thành, sát BigC Miền Đông và ĐH Bách Khoa.",
        "Có sẵn máy lạnh, tủ lạnh, bàn làm việc và cửa sổ kính lớn."
      ]
    }
  ],

  ROOMMATES: [
    {
      id: "hoang-nam",
      name: "Nguyễn Hoàng Nam",
      shortName: "Hoàng Nam",
      age: 20,
      gender: "Nam",
      school: "ĐH Khoa học Tự nhiên CS1 (Q.5)",
      shortSchool: "HCMUS",
      major: "Năm 2 · Khoa Công nghệ Thông tin",
      matchScore: 98,
      matchLabel: "98% Cực hợp gu",
      vnuMember: true,
      hasRoom: true,
      roomStatusTitle: "Đang có phòng sẵn:",
      roomStatusDetail: "Hẻm 48 Đặng Văn Bi, Thủ Đức (2.3tr/tháng)",
      linkedRoomId: "1",
      areaKey: "thu-duc",
      budget: "2.0 - 2.5 tr/tháng",
      avatar:
        "/assets/images/tim-roommate/avatar-1.jpg",
      quote: "“Mình thích nấu cơm trưa mang theo học, cuối tuần thường đọc sách hoặc dọn dẹp phòng trọ.”",
      criteria: [
        "Ngủ 00h00, học đêm đeo tai nghe",
        "Gọn gàng, tự nấu ăn tối",
        "Không hút thuốc",
        "Điện nước chia đều mùng 5"
      ],
      tags: ["#HọcĐêm", "#KhôngHútThuốc", "#NấuĂnTiếtKiệm"]
    },
    {
      id: "minh-anh",
      name: "Lê Minh Anh",
      shortName: "Minh Anh",
      age: 20,
      gender: "Nữ",
      school: "ĐH Kinh tế TP.HCM - UEH (Q.10)",
      shortSchool: "UEH",
      major: "Năm 2 · Marketing & Truyền thông số",
      matchScore: 94,
      matchLabel: "94% Hòa hợp",
      vnuMember: false,
      hasRoom: false,
      roomStatusTitle: "Đang tìm bạn:",
      roomStatusDetail: "Cùng thuê phòng Q.10 hoặc Bình Thạnh (2.0 - 2.8tr)",
      linkedRoomId: "6",
      areaKey: "quan-10",
      budget: "2.0 - 2.8 tr/tháng",
      avatar:
        "/assets/images/trang-chu/avatar-1.jpg",
      quote: "“Rất tôn trọng không gian riêng của roommate, thích chia lịch rửa chén và đi siêu thị chung.”",
      criteria: [
        "Ôn thi nghiêm túc, không ồn ào",
        "Sạch sẽ, thích tự nấu ăn",
        "Không nuôi thú cưng",
        "Hóa đơn chia rạch ròi"
      ],
      tags: ["#ThứcKhuyaHọcBài", "#YênTĩnh", "#NấuĂnNgon"]
    },
    {
      id: "quoc-bao",
      name: "Trần Quốc Bảo",
      shortName: "Quốc Bảo",
      age: 21,
      gender: "Nam",
      school: "ĐH Bách Khoa ĐHQG CS2 (Thủ Đức)",
      shortSchool: "HCMUT",
      major: "Năm 3 · Khoa Kỹ thuật Máy tính",
      matchScore: 91,
      matchLabel: "91% Hòa hợp",
      vnuMember: true,
      hasRoom: true,
      roomStatusTitle: "Đang có phòng sẵn:",
      roomStatusDetail: "KTX & Làng ĐHQG CS2 (1.8tr/tháng)",
      linkedRoomId: "1",
      areaKey: "thu-duc",
      budget: "1.5 - 2.0 tr/tháng",
      avatar:
        "/assets/images/trang-chu/avatar-2.jpg",
      quote: "“Học CNTT nên thỉnh thoảng thức khuya làm đồ án, nhưng luôn đeo tai nghe và giữ phòng yên ắng.”",
      criteria: [
        "Ngủ sau 23h30, dậy 07h00",
        "Thích thể thao cuối tuần",
        "Tự giác lau dọn nhà cửa",
        "Không hút thuốc"
      ],
      tags: ["#SạchSẽ", "#DậySớm", "#ĐeoTaiNghe"]
    },
    {
      id: "thao-vy",
      name: "Vũ Thảo Vy",
      shortName: "Thảo Vy",
      age: 19,
      gender: "Nữ",
      school: "ĐH KHXH&NV TP.HCM (Q.1)",
      shortSchool: "USSH",
      major: "Năm 1 · Báo chí & Truyền thông",
      matchScore: 89,
      matchLabel: "89% Hòa hợp",
      vnuMember: true,
      hasRoom: false,
      roomStatusTitle: "Đang tìm phòng:",
      roomStatusDetail: "Khu vực trung tâm hoặc gần xe buýt ĐHQG (2.0 - 2.5tr)",
      linkedRoomId: "2",
      areaKey: "binh-thanh",
      budget: "2.0 - 2.5 tr/tháng",
      avatar:
        "/assets/images/trang-chu/avatar-3.jpg",
      quote: "“Hướng nội, thích đọc sách & viết lách, rất tôn trọng đồ cá nhân và giờ giấc văn minh.”",
      criteria: [
        "Hướng nội, thích đọc sách & viết lách",
        "Rất sạch sẽ & tôn trọng đồ cá nhân",
        "Giờ giấc sinh hoạt tự do, văn minh",
        "Không dẫn bạn qua đêm"
      ],
      tags: ["#HướngNội", "#GọnGàng", "#TônTrọngRiêngTư"]
    },
    {
      id: "gia-huy",
      name: "Phạm Gia Huy",
      shortName: "Gia Huy",
      age: 21,
      gender: "Nam",
      school: "ĐH Công nghệ Thông tin (UIT - ĐHQG)",
      shortSchool: "UIT",
      major: "Năm 3 · Kỹ thuật Phần mềm",
      matchScore: 87,
      matchLabel: "87% Hòa hợp",
      vnuMember: true,
      hasRoom: true,
      roomStatusTitle: "Đang có phòng sẵn:",
      roomStatusDetail: "Khu phố 6 Linh Trung, Thủ Đức (1.8tr/tháng)",
      linkedRoomId: "1",
      areaKey: "thu-duc",
      budget: "1.5 - 2.2 tr/tháng",
      avatar:
        "/assets/images/trang-chu/avatar-2.jpg",
      quote: "“Thường code tối muộn với tai nghe, cuối tuần hay chạy bộ trong Làng ĐHQG.”",
      criteria: [
        "Không hút thuốc, không nhậu phòng",
        "Chia tiền điện nước rõ ràng",
        "Thoải mái nấu ăn cơ bản",
        "Báo trước khi có bạn ghé"
      ],
      tags: ["#UIT", "#ThểThao", "#RạchRòiChiPhí"]
    },
    {
      id: "ngoc-han",
      name: "Trịnh Ngọc Hân",
      shortName: "Ngọc Hân",
      age: 20,
      gender: "Nữ",
      school: "ĐH Khoa học Tự nhiên (HCMUS CS1)",
      shortSchool: "HCMUS",
      major: "Năm 2 · Hóa học",
      matchScore: 92,
      matchLabel: "92% Rất hợp gu",
      vnuMember: true,
      hasRoom: false,
      roomStatusTitle: "Đang tìm phòng:",
      roomStatusDetail: "Gần Nguyễn Văn Cừ Q.5 hoặc Tô Hiến Thành Q.10 (2.0 - 2.6tr)",
      linkedRoomId: "3",
      areaKey: "quan-5",
      budget: "2.0 - 2.6 tr/tháng",
      avatar:
        "/assets/images/trang-chu/avatar-1.jpg",
      quote: "“Tìm 1 bạn nữ KHTN hoặc Y Dược ở ghép cùng chia sẻ tiền trọ lâu dài.”",
      criteria: [
        "Ngủ trước 23h30, dậy sớm đi lab",
        "Dọn phòng 2 lần/tuần",
        "Không nuôi thú cưng",
        "Tôn trọng giờ nghỉ ngơi"
      ],
      tags: ["#HCMUS", "#SạchSẽ", "#ỞLâuDài"]
    }
  ],

  QUIZ_QUESTIONS: [
    {
      number: 1,
      pillarIndex: 0,
      pillarName: "Nhịp sinh học & Giấc ngủ",
      badgeText: "Phần 1 • Nhịp sinh học",
      weightText: "Trọng số thuật toán: 20% độ tương thích",
      title: "Câu hỏi 1: Giờ đi ngủ và thức dậy thường ngày của bạn như thế nào?",
      subtitle: "Giờ giấc lệch pha là nguyên nhân hàng đầu khiến sinh viên khó ngủ ngon vào mùa ôn thi.",
      options: [
        {
          key: "A",
          title: "Ngủ sớm trước 23h00, dậy trước 07h00",
          desc: "Ưu tiên giấc ngủ đều đặn, thích học buổi sáng sớm và giữ phòng tắt đèn trước 23h.",
          popular: "34%",
          icon: "wb_sunny"
        },
        {
          key: "B",
          title: "Ngủ khoảng 23h30 - 00h30",
          desc: "Nhịp sinh hoạt cân bằng của đa số sinh viên, cần yên tĩnh nhẹ sau 23h30.",
          popular: "46%",
          icon: "bedtime"
        },
        {
          key: "C",
          title: "Cú đêm làm đồ án / học bài sau 01h00",
          desc: "Thường thức khuya chạy deadline nhưng sẵn sàng dùng đèn bàn nhỏ và đeo tai nghe.",
          icon: "nightlight"
        },
        {
          key: "D",
          title: "Linh hoạt theo lịch học & làm thêm",
          desc: "Giờ ngủ thay đổi theo ca làm hoặc lịch thi, ngủ dễ không quá nhạy ánh sáng.",
          icon: "schedule"
        }
      ]
    },
    {
      number: 2,
      pillarIndex: 0,
      pillarName: "Nhịp sinh học & Giấc ngủ",
      badgeText: "Phần 1 • Mức độ tiếng ồn",
      weightText: "Trọng số thuật toán: 15% độ tương thích",
      title: "Câu hỏi 2: Khi bạn cùng phòng đang nghỉ ngơi hoặc ôn thi, mức tiếng ồn bạn chấp nhận được?",
      subtitle: "Giúp thuật toán lọc ra những bạn có cùng thói quen dùng tai nghe, chơi game hoặc học nhóm.",
      options: [
        {
          key: "A",
          title: "Yên tĩnh tuyệt đối, luôn đeo tai nghe",
          desc: "Học bài, xem phim hay gọi điện ban đêm đều đeo tai nghe, không bật loa ngoài.",
          popular: "52%",
          icon: "headphones"
        },
        {
          key: "B",
          title: "Nói chuyện vừa phải trước 22h30",
          desc: "Thoải mái trao đổi hoặc call bạn bè ban ngày, sau 22h30 giữ yên lặng.",
          icon: "record_voice_over"
        },
        {
          key: "C",
          title: "Thoải mái giao lưu, ít nhạy tiếng ồn",
          desc: "Có thể mở nhạc nhẹ hoặc chơi game cùng nhóm bạn vào buổi tối.",
          icon: "music_note"
        },
        {
          key: "D",
          title: "Tôn trọng tín hiệu giờ yên tĩnh",
          desc: "Có thể trao đổi linh hoạt khi nào cần tập trung ôn thi hoặc nghỉ ngơi.",
          icon: "volume_down"
        }
      ]
    },
    {
      number: 3,
      pillarIndex: 1,
      pillarName: "Vệ sinh & Nấu nướng",
      badgeText: "Phần 2 • Thói quen bếp núc",
      weightText: "Trọng số thuật toán: 10% độ tương thích",
      title: "Câu hỏi 3: Bạn thường nấu ăn tại phòng hay ăn ngoài?",
      subtitle: "Ảnh hưởng đến việc chọn phòng có bếp tách biệt, tủ lạnh chung và cách chia tiền gia vị.",
      options: [
        {
          key: "A",
          title: "Tự nấu ăn hàng ngày để tiết kiệm",
          desc: "Nấu cơm trưa mang đi học và nấu bữa tối, ưu tiên phòng có kệ bếp và tủ lạnh.",
          icon: "soup_kitchen"
        },
        {
          key: "B",
          title: "Nấu đơn giản 3-4 bữa/tuần",
          desc: "Thi thoảng nấu mì, luộc đồ hoặc nấu chung nếu roommate hợp khẩu vị.",
          popular: "41%",
          icon: "skillet"
        },
        {
          key: "C",
          title: "Chủ yếu ăn ngoài / căng tin trường",
          desc: "Chỉ dùng ấm đun nước hoặc pha cà phê, giữ khu bếp luôn gọn gàng.",
          icon: "takeout_dining"
        },
        {
          key: "D",
          title: "Nấu chung và chia đều tiền đi chợ",
          desc: "Thích cảm giác sinh hoạt gia đình, luân phiên nấu ăn và rửa bát.",
          icon: "restaurant"
        }
      ]
    },
    {
      number: 4,
      pillarIndex: 1,
      pillarName: "Vệ sinh & Nấu nướng",
      badgeText: "Khảo sát lối sống độc lập",
      weightText: "Trọng số thuật toán: 25% độ tương thích",
      title: "Câu hỏi 4: Thói quen dọn dẹp không gian chung và nấu nướng của bạn như thế nào?",
      subtitle: "Chọn phương án phản ánh đúng nhất sinh hoạt thực tế của bạn khi ở trọ. Điều này giúp tránh 90% mâu thuẫn vụn vặt khi dọn về chung.",
      options: [
        {
          key: "A",
          title: "Ngăn nắp & Dọn dẹp hàng tuần",
          desc: "Rửa bát ngay sau khi nấu, hút bụi/lau nhà 1-2 lần/tuần, phân chia lịch trực nhật không gian chung rõ ràng.",
          popular: "48%",
          icon: "cleaning_services"
        },
        {
          key: "B",
          title: "Linh hoạt & Tự giác",
          desc: "Không quá khắt khe lịch cố định, thấy bẩn sẽ dọn, tự giác rửa chén sau ăn và luôn tôn trọng không gian chung.",
          icon: "balance"
        },
        {
          key: "C",
          title: "Chủ yếu ăn ngoài, ít bày bừa",
          desc: "Thường ăn ở căng tin trường hoặc mua đồ ăn ngoài, phòng ngủ luôn ngăn nắp, hầu như không dùng đến khu bếp trọ.",
          icon: "takeout_dining"
        },
        {
          key: "D",
          title: "Thoải mái, cuối tuần tổng vệ sinh",
          desc: "Trong tuần bận học ca kíp và đi làm thêm nên gom rác và dành trọn vẹn sáng Chủ nhật cùng bạn dọn dẹp kỹ càng.",
          icon: "weekend"
        }
      ]
    },
    {
      number: 5,
      pillarIndex: 2,
      pillarName: "Thú cưng & Tiếp khách",
      badgeText: "Phần 3 • Hút thuốc & Thú cưng",
      weightText: "Trọng số thuật toán: 15% độ tương thích",
      title: "Câu hỏi 5: Quan điểm của bạn về hút thuốc và nuôi thú cưng trong phòng trọ?",
      subtitle: "Đây là tiêu chí lọc cứng (Deal-breaker) giúp đảm bảo sức khỏe và sự thoải mái lâu dài.",
      options: [
        {
          key: "A",
          title: "Không hút thuốc, không thú cưng",
          desc: "Ưu tiên phòng sạch mùi, không dị ứng lông chó mèo và môi trường lành mạnh.",
          popular: "64%",
          icon: "smoke_free"
        },
        {
          key: "B",
          title: "Không hút thuốc, thích nuôi mèo/chó nhỏ",
          desc: "Yêu động vật và có thể chọn phòng trọ cho phép nuôi thú cưng sạch sẽ.",
          icon: "pets"
        },
        {
          key: "C",
          title: "Không hút trong phòng (ra ban công)",
          desc: "Chỉ hút ở khu vực ngoài trời hoặc hoàn toàn không ảnh hưởng bạn cùng phòng.",
          icon: "balcony"
        },
        {
          key: "D",
          title: "Cởi mở nếu thú cưng được giữ vệ sinh tốt",
          desc: "Không dị ứng lông thú, sẵn sàng ở chung nếu roommate chăm sóc kỹ.",
          icon: "favorite"
        }
      ]
    },
    {
      number: 6,
      pillarIndex: 2,
      pillarName: "Thú cưng & Tiếp khách",
      badgeText: "Phần 3 • Khách & Riêng tư",
      weightText: "Trọng số thuật toán: 10% độ tương thích",
      title: "Câu hỏi 6: Quy tắc về việc đưa bạn bè hoặc người thân ghé phòng chơi?",
      subtitle: "Thống nhất trước giúp cả hai giữ được không gian riêng tư mà vẫn thoải mái khi cần thiết.",
      options: [
        {
          key: "A",
          title: "Hạn chế khách, luôn báo trước ít nhất 6 tiếng",
          desc: "Ưu tiên sự riêng tư cá nhân, không dẫn người lạ ngủ lại qua đêm.",
          popular: "55%",
          icon: "lock"
        },
        {
          key: "B",
          title: "Có thể mời bạn cùng trường học nhóm ban ngày",
          desc: "Hoan nghênh bạn bè ghé trao đổi bài tập ban ngày, tránh làm phiền buổi tối.",
          icon: "groups"
        },
        {
          key: "C",
          title: "Thoải mái miễn tôn trọng giờ nghỉ",
          desc: "Chỉ cần báo trước qua tin nhắn và không gây ảnh hưởng sinh hoạt chung.",
          icon: "handshake"
        },
        {
          key: "D",
          title: "Chỉ tiếp khách cùng giới, không qua đêm",
          desc: "Giữ nếp sinh hoạt an toàn, rõ ràng theo thỏa thuận hợp đồng ở ghép.",
          icon: "verified_user"
        }
      ]
    },
    {
      number: 7,
      pillarIndex: 3,
      pillarName: "Ngân sách & Chia phòng",
      badgeText: "Phần 4 • Ngân sách & Khu vực",
      weightText: "Trọng số thuật toán: 10% độ tương thích",
      title: "Câu hỏi 7: Tổng ngân sách hàng tháng (gồm tiền phòng + điện nước) bạn dự kiến là bao nhiêu?",
      subtitle: "Roomie luôn tính tổng chi phí thực đóng mỗi tháng để bạn không gặp bất ngờ phí ẩn.",
      options: [
        {
          key: "A",
          title: "Dưới 1.800.000đ / tháng",
          desc: "Phù hợp khu vực Làng ĐHQG Thủ Đức, Gò Vấp hoặc phòng ở ghép 3-4 bạn.",
          icon: "savings"
        },
        {
          key: "B",
          title: "Từ 1.800.000đ - 2.600.000đ / tháng",
          desc: "Mức phổ biến cho phòng 2 người có máy lạnh, gần ĐHQG, Q.5, Q.10, Bình Thạnh.",
          popular: "51%",
          icon: "payments"
        },
        {
          key: "C",
          title: "Từ 2.600.000đ - 3.500.000đ / tháng",
          desc: "Căn hộ mini hoặc studio mới, thang máy, full nội thất trung tâm.",
          icon: "apartment"
        },
        {
          key: "D",
          title: "Trên 3.500.000đ / tháng",
          desc: "Ưu tiên căn hộ dịch vụ cao cấp hoặc phòng riêng tư tuyệt đối.",
          icon: "workspace_premium"
        }
      ]
    },
    {
      number: 8,
      pillarIndex: 3,
      pillarName: "Ngân sách & Chia phòng",
      badgeText: "Phần 4 • Thanh toán & Đồ dùng",
      weightText: "Trọng số thuật toán: 15% độ tương thích",
      title: "Câu hỏi 8: Cách bạn muốn chia hóa đơn điện nước và dùng chung đồ đạc trong phòng?",
      subtitle: "Minh bạch tiền bạc là chìa khóa cho tình bạn cùng phòng bền vững suốt năm học.",
      options: [
        {
          key: "A",
          title: "Rạch ròi hóa đơn, chia đều đầu người trước mùng 5",
          desc: "Dùng chung bảng tính chi phí hàng tháng, đồ cá nhân dùng riêng hoàn toàn.",
          popular: "62%",
          icon: "receipt_long"
        },
        {
          key: "B",
          title: "Chia đều hóa đơn, dùng chung đồ gia dụng lớn",
          desc: "Tủ lạnh, máy giặt, nồi cơm, gia vị chia sẻ; mỹ phẩm & đồ cá nhân để riêng.",
          icon: "kitchen"
        },
        {
          key: "C",
          title: "Tự do linh hoạt, ưu tiên tin tưởng",
          desc: "Mỗi tháng tổng hợp 1 lần qua MoMo / chuyển khoản nhanh gọn.",
          icon: "account_balance_wallet"
        },
        {
          key: "D",
          title: "Áp dụng Hợp đồng mẫu Roomie ngay từ đầu",
          desc: "Ký biên bản thỏa thuận tiền cọc, chia phí và nội quy phòng trước khi dọn vào.",
          icon: "description"
        }
      ]
    }
  ],

  PRICING_PACKAGES: [
    {
      id: "basic",
      name: "Gói Cơ bản",
      price: "0đ",
      period: "/ vĩnh viễn",
      desc: "Đăng 01 tin cơ bản, xem tối đa 5 hồ sơ roommate/ngày và nhắn tin trực tiếp."
    },
    {
      id: "boost",
      name: "Boost Listing",
      price: "5.000đ",
      period: "/ ngày",
      desc: "Đưa tin lên đầu danh mục tìm kiếm, gắn nhãn 'Cần gấp' và tiếp cận gấp 5 lần."
    },
    {
      id: "match-plus",
      name: "Match Plus",
      price: "9.000đ",
      period: "/ lượt match",
      desc: "Phân tích tương thích chuyên sâu, bật radar lọc cùng trường và nhận mẫu hợp đồng ở ghép."
    },
    {
      id: "verified-pro",
      name: "Xác minh Sinh viên Pro",
      price: "15.000đ",
      period: "/ 6 tháng",
      desc: "Huy hiệu tích xanh Đã xác thực Sinh viên, tăng 90% tỉ lệ phản hồi tin nhắn."
    },
    {
      id: "combo",
      name: "Combo Thần Tốc",
      price: "29.000đ",
      period: "/ tuần",
      desc: "3 lượt Boost Listing + Mở khóa toàn bộ Match Plus + Thông báo phòng mới qua Zalo."
    },
    {
      id: "host",
      name: "Chủ trọ & Nhượng phòng",
      price: "49.000đ",
      period: "/ tháng",
      desc: "Đăng không giới hạn ảnh/video, hiển thị SĐT/Zalo công khai và ghim top đầu chuyên mục."
    }
  ],

  NOTIFICATIONS: [
    {
      id: "n1",
      title: "Hoàng Nam (98% Hợp gu) vừa xem hồ sơ của bạn",
      time: "5 phút trước",
      unread: true,
      href: "/roomie/tim-roommate"
    },
    {
      id: "n2",
      title: "Phòng Studio Đặng Văn Bi giảm còn 2.300.000đ/tháng",
      time: "1 giờ trước",
      unread: true,
      href: "/roomie/phong-chi-tiet?id=1"
    },
    {
      id: "n3",
      title: "Tài khoản HCMUS của bạn đã được xác thực thẻ sinh viên",
      time: "Hôm qua",
      unread: false,
      href: "/roomie/ve-chung-toi"
    }
  ]
};
