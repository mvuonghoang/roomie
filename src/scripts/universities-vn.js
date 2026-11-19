// Danh sách đầy đủ các trường Đại học, Học viện và Phân hiệu tại TP.HCM & Hà Nội
(function () {
  window.RoomieData = window.RoomieData || {};

  window.RoomieData.UNIVERSITIES_HCM_HN = [
    // =========================================================================
    // I. THÀNH PHỐ HỒ CHÍ MINH (TP.HCM)
    // =========================================================================

    // --- Đại học Quốc gia TP.HCM & Các trường thành viên ---
    {
      id: "vnuhcm",
      name: "Đại học Quốc gia TP.HCM",
      code: "VNU-HCM",
      city: "TP.HCM",
      district: "TP. Thủ Đức (Làng Đại học)",
      aliases: ["ĐHQG TP.HCM", "ĐHQG HCM", "Làng Đại học", "KTX ĐHQG", "KTX Khu A", "KTX Khu B", "VNUHCM"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["dhqg", "lang dai hoc", "ktx khu b", "ktx khu a"]
    },
    {
      id: "hcmut",
      name: "Trường Đại học Bách khoa - ĐHQG TP.HCM",
      code: "HCMUT",
      city: "TP.HCM",
      district: "Quận 10 · TP. Thủ Đức",
      aliases: ["Bách khoa TP.HCM", "ĐH Bách khoa", "BK", "QSB", "Tô Hiến Thành", "Làng Đại học"],
      areaKeys: ["quan-10", "thu-duc"],
      roomMatchTerms: ["bach khoa", "hcmut"]
    },
    {
      id: "hcmus",
      name: "Trường Đại học Khoa học Tự nhiên - ĐHQG TP.HCM",
      code: "HCMUS",
      city: "TP.HCM",
      district: "Quận 5 · TP. Thủ Đức",
      aliases: ["KHTN", "Khoa học Tự nhiên", "Tự nhiên", "QST", "Nguyễn Văn Cừ", "Linh Trung"],
      areaKeys: ["quan-5", "thu-duc"],
      roomMatchTerms: ["khtn", "hcmus", "khoa hoc tu nhien"]
    },
    {
      id: "hcmussh",
      name: "Trường Đại học Khoa học Xã hội và Nhân văn - ĐHQG TP.HCM",
      code: "HCMUSSH",
      city: "TP.HCM",
      district: "Quận 1 · TP. Thủ Đức",
      aliases: ["USSH", "Nhân văn", "KHXH&NV", "KHXHNV", "QSX"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["khxh&nv", "nhan van", "ussh", "hcmussh"]
    },
    {
      id: "uit",
      name: "Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM",
      code: "UIT",
      city: "TP.HCM",
      district: "TP. Thủ Đức (Làng Đại học)",
      aliases: ["CNTT", "Công nghệ Thông tin", "QSC", "Làng Đại học"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["uit", "cong nghe thong tin"]
    },
    {
      id: "uel",
      name: "Trường Đại học Kinh tế - Luật - ĐHQG TP.HCM",
      code: "UEL",
      city: "TP.HCM",
      district: "TP. Thủ Đức",
      aliases: ["Kinh tế Luật", "QSK", "Linh Xuân"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["uel", "kinh te luat"]
    },
    {
      id: "hcmiu",
      name: "Trường Đại học Quốc tế - ĐHQG TP.HCM",
      code: "IU",
      city: "TP.HCM",
      district: "TP. Thủ Đức (Làng Đại học)",
      aliases: ["HCMIU", "ĐH Quốc tế", "International University", "QSQ"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["hcmiu", "quoc te dhqg"]
    },
    {
      id: "uhs",
      name: "Trường Đại học Khoa học Sức khỏe - ĐHQG TP.HCM",
      code: "UHS",
      city: "TP.HCM",
      district: "TP. Thủ Đức (Làng Đại học)",
      aliases: ["Khoa Y ĐHQG", "Khoa học Sức khỏe", "QSY"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["khoa y dhqg", "khoa hoc suc khoe"]
    },

    // --- Các Đại học & Trường Đại học Công lập tại TP.HCM ---
    {
      id: "ueh",
      name: "Đại học Kinh tế TP.HCM",
      code: "UEH",
      city: "TP.HCM",
      district: "Quận 3 · Quận 10 · Bình Chánh",
      aliases: ["Kinh tế TP.HCM", "KSA", "Nguyễn Tri Phương"],
      areaKeys: ["quan-10"],
      roomMatchTerms: ["ueh", "kinh te"]
    },
    {
      id: "ump",
      name: "Trường Đại học Y Dược TP.HCM",
      code: "UMP",
      city: "TP.HCM",
      district: "Quận 5",
      aliases: ["Y Dược TP.HCM", "YDS", "Hồng Bàng Q5"],
      areaKeys: ["quan-5"],
      roomMatchTerms: ["y duoc"]
    },
    {
      id: "pntu",
      name: "Trường Đại học Y khoa Phạm Ngọc Thạch",
      code: "PNTU",
      city: "TP.HCM",
      district: "Quận 10",
      aliases: ["Phạm Ngọc Thạch", "Y Phạm Ngọc Thạch", "TYS"],
      areaKeys: ["quan-10"],
      roomMatchTerms: ["pham ngoc thach"]
    },
    {
      id: "hcmue",
      name: "Trường Đại học Sư phạm TP.HCM",
      code: "HCMUE",
      city: "TP.HCM",
      district: "Quận 5",
      aliases: ["Sư phạm TP.HCM", "SPS", "An Dương Vương"],
      areaKeys: ["quan-5"],
      roomMatchTerms: ["su pham tp", "hcmue"]
    },
    {
      id: "hcmute",
      name: "Trường Đại học Công nghệ Kỹ thuật TP.HCM",
      code: "HCMUTE",
      city: "TP.HCM",
      district: "TP. Thủ Đức",
      aliases: ["ĐH Sư phạm Kỹ thuật TP.HCM", "SPKT", "SPK", "UTE", "Võ Văn Ngân"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["su pham ky thuat", "cong nghe ky thuat", "hcmute", "spkt"]
    },
    {
      id: "iuh",
      name: "Trường Đại học Công nghiệp TP.HCM",
      code: "IUH",
      city: "TP.HCM",
      district: "Quận Gò Vấp",
      aliases: ["Công nghiệp TP.HCM", "Nguyễn Văn Bảo"],
      areaKeys: ["go-vap"],
      roomMatchTerms: ["iuh", "cong nghiep"]
    },
    {
      id: "huit",
      name: "Trường Đại học Công Thương TP.HCM",
      code: "HUIT",
      city: "TP.HCM",
      district: "Quận Tân Phú",
      aliases: ["Công Thương", "ĐH Công nghiệp Thực phẩm", "HUFI", "DCT", "Lê Trọng Tấn"],
      areaKeys: [],
      roomMatchTerms: ["huit", "hufi", "cong thuong", "cong nghiep thuc pham"]
    },
    {
      id: "hub",
      name: "Trường Đại học Ngân hàng TP.HCM",
      code: "HUB",
      city: "TP.HCM",
      district: "Quận 1 · TP. Thủ Đức",
      aliases: ["BUH", "Ngân hàng TP.HCM", "NHS", "Hoàng Diệu 2"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["ngan hang", "hub", "buh"]
    },
    {
      id: "ulaw",
      name: "Trường Đại học Luật TP.HCM",
      code: "ULAW",
      city: "TP.HCM",
      district: "Quận 4 · TP. Thủ Đức",
      aliases: ["HCMUL", "Luật TP.HCM", "LPS", "Nguyễn Tất Thành"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["luat tp", "ulaw", "hcmul"]
    },
    {
      id: "nlu",
      name: "Trường Đại học Nông Lâm TP.HCM",
      code: "NLU",
      city: "TP.HCM",
      district: "TP. Thủ Đức",
      aliases: ["Nông Lâm", "NLS", "Linh Trung"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["nong lam"]
    },
    {
      id: "ufm",
      name: "Trường Đại học Tài chính - Marketing",
      code: "UFM",
      city: "TP.HCM",
      district: "Quận 7 · Phú Nhuận · TP. Thủ Đức",
      aliases: ["Tài chính Marketing", "DMS"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["tai chinh marketing", "ufm"]
    },
    {
      id: "ou",
      name: "Trường Đại học Mở TP.HCM",
      code: "OU",
      city: "TP.HCM",
      district: "Quận 3 · Gò Vấp · Nhà Bè",
      aliases: ["HCMCOU", "ĐH Mở", "MBS"],
      areaKeys: ["go-vap"],
      roomMatchTerms: ["mo tp", "hcmcou"]
    },
    {
      id: "sgu",
      name: "Trường Đại học Sài Gòn",
      code: "SGU",
      city: "TP.HCM",
      district: "Quận 5",
      aliases: ["ĐH Sài Gòn", "SGD", "An Dương Vương"],
      areaKeys: ["quan-5"],
      roomMatchTerms: ["sai gon", "sgu"]
    },
    {
      id: "uth",
      name: "Trường Đại học Giao thông Vận tải TP.HCM",
      code: "UTH",
      city: "TP.HCM",
      district: "Quận Bình Thạnh · TP. Thủ Đức",
      aliases: ["GTVT TP.HCM", "Giao thông Vận tải", "GTS", "D3 Bình Thạnh"],
      areaKeys: ["binh-thanh", "thu-duc"],
      roomMatchTerms: ["gtvt", "giao thong van tai", "uth"]
    },
    {
      id: "utc2",
      name: "Phân hiệu Trường Đại học Giao thông Vận tải tại TP.HCM",
      code: "UTC2",
      city: "TP.HCM",
      district: "TP. Thủ Đức",
      aliases: ["GTVT Cơ sở 2", "GSA", "Lê Văn Việt"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["utc2", "giao thong van tai"]
    },
    {
      id: "ftu2",
      name: "Phân hiệu Trường Đại học Ngoại thương tại TP.HCM",
      code: "FTU2",
      city: "TP.HCM",
      district: "Quận Bình Thạnh",
      aliases: ["Ngoại thương CS2", "Ngoại thương TP.HCM", "NTS", "D5 Bình Thạnh"],
      areaKeys: ["binh-thanh"],
      roomMatchTerms: ["ftu2", "ngoai thuong"]
    },
    {
      id: "tlu-hcm",
      name: "Phân hiệu Trường Đại học Thủy lợi tại TP.HCM",
      code: "TLU-HCM",
      city: "TP.HCM",
      district: "Quận Bình Thạnh",
      aliases: ["Thủy lợi TP.HCM", "TLS", "Trường Sa"],
      areaKeys: ["binh-thanh"],
      roomMatchTerms: ["thuy loi"]
    },
    {
      id: "uah",
      name: "Trường Đại học Kiến trúc TP.HCM",
      code: "UAH",
      city: "TP.HCM",
      district: "Quận 3 · TP. Thủ Đức",
      aliases: ["Kiến trúc TP.HCM", "KTS", "Pasteur"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["kien truc tp", "uah"]
    },
    {
      id: "hcmufa",
      name: "Trường Đại học Mỹ thuật TP.HCM",
      code: "HCMUFA",
      city: "TP.HCM",
      district: "Quận Bình Thạnh",
      aliases: ["Mỹ thuật TP.HCM", "MTS", "Phan Đăng Lưu"],
      areaKeys: ["binh-thanh"],
      roomMatchTerms: ["my thuat tp", "hcmufa"]
    },
    {
      id: "hcmunre",
      name: "Trường Đại học Tài nguyên và Môi trường TP.HCM",
      code: "HCMUNRE",
      city: "TP.HCM",
      district: "Quận Tân Bình",
      aliases: ["Tài nguyên Môi trường", "DTM", "Lê Văn Sỹ"],
      areaKeys: [],
      roomMatchTerms: ["tai nguyen", "hcmunre"]
    },
    {
      id: "hcmuc",
      name: "Trường Đại học Văn hóa TP.HCM",
      code: "HCMUC",
      city: "TP.HCM",
      district: "TP. Thủ Đức",
      aliases: ["Văn hóa TP.HCM", "VHS", "Quốc Hương"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["van hoa tp", "hcmuc"]
    },
    {
      id: "skda-hcm",
      name: "Trường Đại học Sân khấu - Điện ảnh TP.HCM",
      code: "SKDA-HCM",
      city: "TP.HCM",
      district: "Quận 1",
      aliases: ["Sân khấu Điện ảnh TP.HCM", "DSD", "Cống Quỳnh"],
      areaKeys: [],
      roomMatchTerms: ["san khau dien anh"]
    },
    {
      id: "hcmcons",
      name: "Nhạc viện TP.HCM",
      code: "HCMCONS",
      city: "TP.HCM",
      district: "Quận 1",
      aliases: ["Nhạc viện", "NVS", "Nguyễn Du"],
      areaKeys: [],
      roomMatchTerms: ["nhac vien"]
    },
    {
      id: "ush",
      name: "Trường Đại học Thể dục Thể thao TP.HCM",
      code: "USH",
      city: "TP.HCM",
      district: "TP. Thủ Đức (Làng Đại học)",
      aliases: ["TDTT TP.HCM", "TDS"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["the duc the thao", "ush"]
    },
    {
      id: "hcmupes",
      name: "Trường Đại học Sư phạm Thể dục Thể thao TP.HCM",
      code: "HCMUPES",
      city: "TP.HCM",
      district: "Quận 5",
      aliases: ["Sư phạm TDTT TP.HCM", "STS", "Nguyễn Trãi"],
      areaKeys: ["quan-5"],
      roomMatchTerms: ["su pham the duc", "hcmupes"]
    },
    {
      id: "tdtu",
      name: "Trường Đại học Tôn Đức Thắng",
      code: "TDTU",
      city: "TP.HCM",
      district: "Quận 7",
      aliases: ["Tôn Đức Thắng", "DTT", "Nguyễn Hữu Thọ"],
      areaKeys: [],
      roomMatchTerms: ["ton duc thang", "tdtu"]
    },
    {
      id: "ulsa2",
      name: "Trường Đại học Lao động - Xã hội (Cơ sở II TP.HCM)",
      code: "ULSA2",
      city: "TP.HCM",
      district: "Quận 12",
      aliases: ["Lao động Xã hội TP.HCM", "DLS"],
      areaKeys: [],
      roomMatchTerms: ["lao dong xa hoi", "ulsa2"]
    },
    {
      id: "annd-hcm",
      name: "Học viện An ninh Nhân dân - Phân hiệu TP.HCM (ĐH An ninh Nhân dân)",
      code: "ANND",
      city: "TP.HCM",
      district: "TP. Thủ Đức",
      aliases: ["Trường Đại học An ninh Nhân dân", "ANS", "Linh Trung"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["an ninh nhan dan", "annd"]
    },
    {
      id: "csnd-hcm",
      name: "Học viện Cảnh sát Nhân dân - Phân hiệu TP.HCM (ĐH Cảnh sát Nhân dân)",
      code: "CSND",
      city: "TP.HCM",
      district: "Quận 7 · TP. Thủ Đức",
      aliases: ["Trường Đại học Cảnh sát Nhân dân", "CSS"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["canh sat nhan dan", "csnd"]
    },
    {
      id: "tdn",
      name: "Trường Đại học Trần Đại Nghĩa (Sĩ quan Kỹ thuật Quân sự)",
      code: "VPH",
      city: "TP.HCM",
      district: "Quận Gò Vấp",
      aliases: ["Trần Đại Nghĩa", "Sĩ quan Kỹ thuật Quân sự", "Nguyễn Oanh"],
      areaKeys: ["go-vap"],
      roomMatchTerms: ["tran dai nghia"]
    },

    // --- Các Học viện tại TP.HCM ---
    {
      id: "hca-hcm",
      name: "Học viện Cán bộ TP.HCM",
      code: "HCA",
      city: "TP.HCM",
      district: "Quận Bình Thạnh",
      aliases: ["Cán bộ TP.HCM", "HVC", "Chu Văn An"],
      areaKeys: ["binh-thanh"],
      roomMatchTerms: ["hoc vien can bo"]
    },
    {
      id: "vaa",
      name: "Học viện Hàng không Việt Nam",
      code: "VAA",
      city: "TP.HCM",
      district: "Quận Tân Bình",
      aliases: ["Hàng không", "HHK", "Nguyễn Văn Trỗi"],
      areaKeys: [],
      roomMatchTerms: ["hang khong", "vaa"]
    },
    {
      id: "ptit-hcm",
      name: "Học viện Công nghệ Bưu chính Viễn thông - Cơ sở TP.HCM",
      code: "PTIT-HCM",
      city: "TP.HCM",
      district: "TP. Thủ Đức · Quận 1",
      aliases: ["Bưu chính Viễn thông TP.HCM", "PTIT", "BVS", "Man Thiện"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["buu chinh vien thong", "ptit"]
    },
    {
      id: "napa-hcm",
      name: "Học viện Hành chính và Quản trị công - Phân hiệu TP.HCM",
      code: "APAG-HCM",
      city: "TP.HCM",
      district: "Quận 10",
      aliases: ["Học viện Hành chính Quốc gia TP.HCM", "NAPA HCM", "Phân hiệu ĐH Nội vụ TP.HCM", "Đường 3/2"],
      areaKeys: ["quan-10"],
      roomMatchTerms: ["hanh chinh", "noi vu", "apag"]
    },
    {
      id: "kma-hcm",
      name: "Học viện Kỹ thuật Mật mã - Phân hiệu TP.HCM",
      code: "KMA-HCM",
      city: "TP.HCM",
      district: "Quận Tân Bình",
      aliases: ["Kỹ thuật Mật mã TP.HCM", "ACTVN", "Cộng Hòa"],
      areaKeys: [],
      roomMatchTerms: ["ky thuat mat ma", "kma"]
    },
    {
      id: "vya-hcm",
      name: "Học viện Thanh thiếu niên Việt Nam - Phân viện miền Nam",
      code: "VYA-HCM",
      city: "TP.HCM",
      district: "TP. Thủ Đức",
      aliases: ["Thanh thiếu niên miền Nam", "HVN"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["thanh thieu nien"]
    },
    {
      id: "aof-hcm",
      name: "Học viện Tài chính - Phân hiệu tại TP.HCM",
      code: "AOF-HCM",
      city: "TP.HCM",
      district: "TP.HCM",
      aliases: ["Tài chính TP.HCM"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien tai chinh"]
    },
    {
      id: "vwa-hcm",
      name: "Học viện Phụ nữ Việt Nam - Phân hiệu tại TP.HCM",
      code: "VWA-HCM",
      city: "TP.HCM",
      district: "Quận 3",
      aliases: ["Phụ nữ Việt Nam TP.HCM"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien phu nu"]
    },
    {
      id: "hvtp-hcm",
      name: "Học viện Tư pháp - Cơ sở tại TP.HCM",
      code: "HVTP-HCM",
      city: "TP.HCM",
      district: "TP. Thủ Đức",
      aliases: ["Tư pháp TP.HCM"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["hoc vien tu phap"]
    },
    {
      id: "vba-hcm",
      name: "Học viện Phật giáo Việt Nam tại TP.HCM",
      code: "VBA-HCM",
      city: "TP.HCM",
      district: "Huyện Bình Chánh",
      aliases: ["Phật giáo TP.HCM", "Lê Minh Xuân"],
      areaKeys: [],
      roomMatchTerms: ["phat giao"]
    },

    // --- Các Trường Đại học Tư thục & Quốc tế tại TP.HCM ---
    {
      id: "hutech",
      name: "Trường Đại học Công nghệ TP.HCM",
      code: "HUTECH",
      city: "TP.HCM",
      district: "Quận Bình Thạnh · TP. Thủ Đức",
      aliases: ["DKC", "Điện Biên Phủ", "Khu CNC"],
      areaKeys: ["binh-thanh", "thu-duc"],
      roomMatchTerms: ["hutech"]
    },
    {
      id: "vlu",
      name: "Trường Đại học Văn Lang",
      code: "VLU",
      city: "TP.HCM",
      district: "Quận Bình Thạnh · Quận Gò Vấp · Quận 1",
      aliases: ["Văn Lang", "DVL", "Đặng Thùy Trâm"],
      areaKeys: ["binh-thanh", "go-vap"],
      roomMatchTerms: ["van lang", "vlu"]
    },
    {
      id: "uef",
      name: "Trường Đại học Kinh tế - Tài chính TP.HCM",
      code: "UEF",
      city: "TP.HCM",
      district: "Quận Bình Thạnh",
      aliases: ["Kinh tế Tài chính", "KTC", "Điện Biên Phủ"],
      areaKeys: ["binh-thanh"],
      roomMatchTerms: ["uef", "kinh te tai chinh"]
    },
    {
      id: "nttu",
      name: "Trường Đại học Nguyễn Tất Thành",
      code: "NTTU",
      city: "TP.HCM",
      district: "Quận 4 · Quận 12 · TP. Thủ Đức",
      aliases: ["Nguyễn Tất Thành", "NTT"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["nguyen tat thanh", "nttu"]
    },
    {
      id: "hsu",
      name: "Trường Đại học Hoa Sen",
      code: "HSU",
      city: "TP.HCM",
      district: "Quận 1 · Quận 10 · Quận Gò Vấp",
      aliases: ["Hoa Sen", "DTH", "Nguyễn Văn Tráng", "Thành Thái"],
      areaKeys: ["quan-10", "go-vap"],
      roomMatchTerms: ["hoa sen", "hsu"]
    },
    {
      id: "vhu",
      name: "Trường Đại học Văn Hiến",
      code: "VHU",
      city: "TP.HCM",
      district: "Quận 10 · Tân Phú · Bình Chánh",
      aliases: ["Văn Hiến", "DVH"],
      areaKeys: ["quan-10"],
      roomMatchTerms: ["van hien", "vhu"]
    },
    {
      id: "huflit",
      name: "Trường Đại học Ngoại ngữ - Tin học TP.HCM",
      code: "HUFLIT",
      city: "TP.HCM",
      district: "Quận 10 · Hóc Môn",
      aliases: ["Ngoại ngữ Tin học", "DNT", "Sư Vạn Hạnh"],
      areaKeys: ["quan-10"],
      roomMatchTerms: ["huflit", "ngoai ngu tin hoc"]
    },
    {
      id: "stu",
      name: "Trường Đại học Công nghệ Sài Gòn",
      code: "STU",
      city: "TP.HCM",
      district: "Quận 8",
      aliases: ["Công nghệ Sài Gòn", "DSG", "Cao Lỗ"],
      areaKeys: [],
      roomMatchTerms: ["cong nghe sai gon", "stu"]
    },
    {
      id: "hiu",
      name: "Trường Đại học Quốc tế Hồng Bàng",
      code: "HIU",
      city: "TP.HCM",
      district: "Quận Bình Thạnh · Quận 6",
      aliases: ["Hồng Bàng", "Điện Biên Phủ"],
      areaKeys: ["binh-thanh"],
      roomMatchTerms: ["hong bang", "hiu"]
    },
    {
      id: "siu",
      name: "Trường Đại học Quốc tế Sài Gòn",
      code: "SIU",
      city: "TP.HCM",
      district: "TP. Thủ Đức (Thảo Điền)",
      aliases: ["Quốc tế Sài Gòn", "SIG", "TTQ"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["quoc te sai gon", "siu"]
    },
    {
      id: "gdu",
      name: "Trường Đại học Gia Định",
      code: "GDU",
      city: "TP.HCM",
      district: "Quận Gò Vấp",
      aliases: ["Gia Định", "Nguyễn Kiệm"],
      areaKeys: ["go-vap"],
      roomMatchTerms: ["gia dinh", "gdu"]
    },
    {
      id: "dhv",
      name: "Trường Đại học Hùng Vương TP.HCM",
      code: "DHV",
      city: "TP.HCM",
      district: "Quận 5",
      aliases: ["Hùng Vương TP.HCM", "Nguyễn Trãi"],
      areaKeys: ["quan-5"],
      roomMatchTerms: ["hung vuong"]
    },
    {
      id: "umt",
      name: "Trường Đại học Quản lý và Công nghệ TP.HCM",
      code: "UMT",
      city: "TP.HCM",
      district: "TP. Thủ Đức (Cát Lái)",
      aliases: ["Quản lý và Công nghệ", "Cát Lái"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["umt", "quan ly va cong nghe"]
    },
    {
      id: "fpt-hcm",
      name: "Trường Đại học FPT TP.HCM",
      code: "FPTU-HCM",
      city: "TP.HCM",
      district: "TP. Thủ Đức (Khu Công nghệ cao)",
      aliases: ["FPT TP.HCM", "FPTU", "Khu Công nghệ cao"],
      areaKeys: ["thu-duc"],
      roomMatchTerms: ["fpt"]
    },
    {
      id: "rmit-hcm",
      name: "Đại học RMIT Việt Nam - Cơ sở Nam Sài Gòn",
      code: "RMIT-HCM",
      city: "TP.HCM",
      district: "Quận 7",
      aliases: ["RMIT TP.HCM", "Nam Sài Gòn", "Nguyễn Văn Linh"],
      areaKeys: [],
      roomMatchTerms: ["rmit"]
    },
    {
      id: "fuv",
      name: "Đại học Fulbright Việt Nam",
      code: "FUV",
      city: "TP.HCM",
      district: "Quận 7 · TP. Thủ Đức",
      aliases: ["Fulbright"],
      areaKeys: [],
      roomMatchTerms: ["fulbright"]
    },
    {
      id: "greenwich-hcm",
      name: "Đại học Greenwich Việt Nam - Cơ sở TP.HCM",
      code: "Greenwich-HCM",
      city: "TP.HCM",
      district: "Quận Tân Bình",
      aliases: ["Greenwich TP.HCM", "Cộng Hòa"],
      areaKeys: [],
      roomMatchTerms: ["greenwich"]
    },
    {
      id: "swinburne-hcm",
      name: "Swinburne Việt Nam - Cơ sở TP.HCM",
      code: "Swinburne-HCM",
      city: "TP.HCM",
      district: "Quận Tân Bình",
      aliases: ["Swinburne TP.HCM", "Bạch Đằng"],
      areaKeys: [],
      roomMatchTerms: ["swinburne"]
    },
    {
      id: "sbs",
      name: "Trường Kinh doanh Sài Gòn",
      code: "SBS",
      city: "TP.HCM",
      district: "Quận 7",
      aliases: ["Saigon Business School"],
      areaKeys: [],
      roomMatchTerms: ["kinh doanh sai gon", "sbs"]
    },

    // =========================================================================
    // II. THÀNH PHỐ HÀ NỘI
    // =========================================================================

    // --- Đại học Quốc gia Hà Nội & Các trường thành viên ---
    {
      id: "vnuhn",
      name: "Đại học Quốc gia Hà Nội",
      code: "VNU",
      city: "Hà Nội",
      district: "Quận Cầu Giấy · Thạch Thất (Hòa Lạc)",
      aliases: ["ĐHQG Hà Nội", "ĐHQGHN", "QGH", "Xuân Thủy", "Hòa Lạc"],
      areaKeys: [],
      roomMatchTerms: ["dhqg ha noi", "vnu", "xuan thuy"]
    },
    {
      id: "uet",
      name: "Trường Đại học Công nghệ - ĐHQG Hà Nội",
      code: "UET",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["ĐH Công nghệ Hà Nội", "QHI", "Xuân Thủy"],
      areaKeys: [],
      roomMatchTerms: ["uet", "cong nghe ha noi"]
    },
    {
      id: "hus",
      name: "Trường Đại học Khoa học Tự nhiên - ĐHQG Hà Nội",
      code: "HUS",
      city: "Hà Nội",
      district: "Quận Thanh Xuân",
      aliases: ["KHTN Hà Nội", "Tự nhiên Hà Nội", "QHT", "Nguyễn Trãi"],
      areaKeys: [],
      roomMatchTerms: ["hus", "khtn ha noi"]
    },
    {
      id: "vnu-ussh",
      name: "Trường Đại học Khoa học Xã hội và Nhân văn - ĐHQG Hà Nội",
      code: "VNU-USSH",
      city: "Hà Nội",
      district: "Quận Thanh Xuân",
      aliases: ["Nhân văn Hà Nội", "KHXH&NV Hà Nội", "QHX", "Nguyễn Trãi"],
      areaKeys: [],
      roomMatchTerms: ["nhan van ha noi", "ussh ha noi"]
    },
    {
      id: "ulis",
      name: "Trường Đại học Ngoại ngữ - ĐHQG Hà Nội",
      code: "ULIS",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Ngoại ngữ ĐHQG", "QHF", "Phạm Văn Đồng"],
      areaKeys: [],
      roomMatchTerms: ["ulis", "ngoai ngu ha noi"]
    },
    {
      id: "ueb",
      name: "Trường Đại học Kinh tế - ĐHQG Hà Nội",
      code: "UEB",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Kinh tế ĐHQG Hà Nội", "QHE", "Xuân Thủy"],
      areaKeys: [],
      roomMatchTerms: ["ueb", "kinh te dhqg"]
    },
    {
      id: "ued",
      name: "Trường Đại học Giáo dục - ĐHQG Hà Nội",
      code: "UEd",
      city: "Hà Nội",
      district: "Quận Cầu Giấy · Thạch Thất",
      aliases: ["Giáo dục ĐHQG", "QHS"],
      areaKeys: [],
      roomMatchTerms: ["giao duc dhqg"]
    },
    {
      id: "vnu-ul",
      name: "Trường Đại học Luật - ĐHQG Hà Nội",
      code: "VNU-UL",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Khoa Luật ĐHQG Hà Nội", "QHL"],
      areaKeys: [],
      roomMatchTerms: ["luat dhqg"]
    },
    {
      id: "vnu-ump",
      name: "Trường Đại học Y Dược - ĐHQG Hà Nội",
      code: "VNU-UMP",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Y Dược ĐHQG Hà Nội", "QHY"],
      areaKeys: [],
      roomMatchTerms: ["y duoc dhqg"]
    },
    {
      id: "vju",
      name: "Trường Đại học Việt - Nhật - ĐHQG Hà Nội",
      code: "VJU",
      city: "Hà Nội",
      district: "Quận Nam Từ Liêm · Hòa Lạc",
      aliases: ["Việt Nhật", "QHJ", "Mỹ Đình"],
      areaKeys: [],
      roomMatchTerms: ["viet nhat", "vju"]
    },
    {
      id: "vnu-is",
      name: "Trường Quốc tế - ĐHQG Hà Nội",
      code: "VNU-IS",
      city: "Hà Nội",
      district: "Quận Cầu Giấy · Thanh Xuân",
      aliases: ["Trường Quốc tế ĐHQGHN", "QHQ"],
      areaKeys: [],
      roomMatchTerms: ["quoc te dhqg ha noi", "vnu-is"]
    },
    {
      id: "hsb",
      name: "Trường Quản trị và Kinh doanh - ĐHQG Hà Nội",
      code: "HSB",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Quản trị Kinh doanh ĐHQG"],
      areaKeys: [],
      roomMatchTerms: ["hsb"]
    },
    {
      id: "vnu-sis",
      name: "Trường Khoa học Liên ngành và Nghệ thuật - ĐHQG Hà Nội",
      code: "VNU-SIS",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Khoa học Liên ngành và Nghệ thuật"],
      areaKeys: [],
      roomMatchTerms: ["lien nganh"]
    },

    // --- Các Đại học & Trường Đại học Công lập tại Hà Nội ---
    {
      id: "hust",
      name: "Đại học Bách khoa Hà Nội",
      code: "HUST",
      city: "Hà Nội",
      district: "Quận Hai Bà Trưng",
      aliases: ["Bách khoa Hà Nội", "BKHN", "BKA", "Giải Phóng", "Đại Cồ Việt"],
      areaKeys: [],
      roomMatchTerms: ["bach khoa ha noi", "hust"]
    },
    {
      id: "neu",
      name: "Đại học Kinh tế Quốc dân",
      code: "NEU",
      city: "Hà Nội",
      district: "Quận Hai Bà Trưng",
      aliases: ["Kinh tế Quốc dân", "KTQD", "KHA", "Trần Đại Nghĩa"],
      areaKeys: [],
      roomMatchTerms: ["kinh te quoc dan", "neu"]
    },
    {
      id: "ftu",
      name: "Trường Đại học Ngoại thương",
      code: "FTU",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Ngoại thương Hà Nội", "NTH", "Chùa Láng"],
      areaKeys: [],
      roomMatchTerms: ["ngoai thuong ha noi", "ftu"]
    },
    {
      id: "tmu",
      name: "Trường Đại học Thương mại",
      code: "TMU",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Thương mại", "Hồ Tùng Mậu"],
      areaKeys: [],
      roomMatchTerms: ["thuong mai", "tmu"]
    },
    {
      id: "hlu",
      name: "Trường Đại học Luật Hà Nội",
      code: "HLU",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Luật Hà Nội", "LPH", "Nguyễn Chí Thanh"],
      areaKeys: [],
      roomMatchTerms: ["luat ha noi", "hlu"]
    },
    {
      id: "hpu",
      name: "Trường Đại học Kiểm sát (ĐH Kiểm sát Hà Nội)",
      code: "HPU",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Kiểm sát Hà Nội", "DKS", "Dương Nội"],
      areaKeys: [],
      roomMatchTerms: ["kiem sat"]
    },
    {
      id: "tuu",
      name: "Trường Đại học Công đoàn",
      code: "TUU",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Công đoàn", "LDA", "Tây Sơn"],
      areaKeys: [],
      roomMatchTerms: ["cong doan", "tuu"]
    },
    {
      id: "ulsa",
      name: "Trường Đại học Lao động - Xã hội",
      code: "ULSA",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Lao động Xã hội Hà Nội", "DLX", "Trần Duy Hưng"],
      areaKeys: [],
      roomMatchTerms: ["lao dong xa hoi", "ulsa"]
    },
    {
      id: "utc",
      name: "Trường Đại học Giao thông Vận tải",
      code: "UTC",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["GTVT Hà Nội", "GHA", "Láng Thượng"],
      areaKeys: [],
      roomMatchTerms: ["giao thong van tai ha noi", "utc"]
    },
    {
      id: "utt",
      name: "Trường Đại học Công nghệ Giao thông Vận tải",
      code: "UTT",
      city: "Hà Nội",
      district: "Quận Thanh Xuân",
      aliases: ["Công nghệ GTVT", "GTA", "Triều Khúc"],
      areaKeys: [],
      roomMatchTerms: ["cong nghe giao thong", "utt"]
    },
    {
      id: "huce",
      name: "Trường Đại học Xây dựng Hà Nội",
      code: "HUCE",
      city: "Hà Nội",
      district: "Quận Hai Bà Trưng",
      aliases: ["Xây dựng", "NUCE", "XDH", "Giải Phóng"],
      areaKeys: [],
      roomMatchTerms: ["xay dung ha noi", "huce", "nuce"]
    },
    {
      id: "hau",
      name: "Trường Đại học Kiến trúc Hà Nội",
      code: "HAU",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Kiến trúc Hà Nội", "KTA", "Nguyễn Trãi"],
      areaKeys: [],
      roomMatchTerms: ["kien truc ha noi", "hau"]
    },
    {
      id: "humg",
      name: "Trường Đại học Mỏ - Địa chất",
      code: "HUMG",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm",
      aliases: ["Mỏ Địa chất", "MDA", "Đức Thắng"],
      areaKeys: [],
      roomMatchTerms: ["mo dia chat", "humg"]
    },
    {
      id: "haui",
      name: "Trường Đại học Công nghiệp Hà Nội",
      code: "HaUI",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm",
      aliases: ["Công nghiệp Hà Nội", "DCN", "Nhổn"],
      areaKeys: [],
      roomMatchTerms: ["cong nghiep ha noi", "haui"]
    },
    {
      id: "hict",
      name: "Trường Đại học Công nghiệp và Thương mại Hà Nội",
      code: "HTU",
      city: "Hà Nội",
      district: "Huyện Gia Lâm",
      aliases: ["ĐH Công nghiệp Dệt may Hà Nội", "Dệt may Hà Nội", "CCM", "Lệ Chi"],
      areaKeys: [],
      roomMatchTerms: ["det may ha noi", "cong nghiep va thuong mai"]
    },
    {
      id: "viu",
      name: "Trường Đại học Công nghiệp Việt - Hung",
      code: "VIU",
      city: "Hà Nội",
      district: "Thị xã Sơn Tây · Thạch Thất",
      aliases: ["Việt Hung", "VHD"],
      areaKeys: [],
      roomMatchTerms: ["viet hung", "viu"]
    },
    {
      id: "uneti",
      name: "Trường Đại học Kinh tế - Kỹ thuật Công nghiệp",
      code: "UNETI",
      city: "Hà Nội",
      district: "Quận Hai Bà Trưng · Quận Hoàng Mai",
      aliases: ["Kinh tế Kỹ thuật Công nghiệp", "DKK", "Minh Khai", "Lĩnh Nam"],
      areaKeys: [],
      roomMatchTerms: ["uneti", "kinh te ky thuat cong nghiep"]
    },
    {
      id: "epu",
      name: "Trường Đại học Điện lực",
      code: "EPU",
      city: "Hà Nội",
      district: "Quận Cầu Giấy · Bắc Từ Liêm",
      aliases: ["Điện lực", "DDL", "Hoàng Quốc Việt"],
      areaKeys: [],
      roomMatchTerms: ["dien luc", "epu"]
    },
    {
      id: "tlu-hn",
      name: "Trường Đại học Thủy lợi",
      code: "TLU",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Thủy lợi Hà Nội", "TLA", "Tây Sơn"],
      areaKeys: [],
      roomMatchTerms: ["thuy loi ha noi", "tlu"]
    },
    {
      id: "hanu",
      name: "Trường Đại học Hà Nội",
      code: "HANU",
      city: "Hà Nội",
      district: "Quận Nam Từ Liêm · Thanh Xuân",
      aliases: ["ĐH Hà Nội", "NHF", "Nguyễn Trãi"],
      areaKeys: [],
      roomMatchTerms: ["hanu", "dai hoc ha noi"]
    },
    {
      id: "usth",
      name: "Trường Đại học Khoa học và Công nghệ Hà Nội (ĐH Việt - Pháp)",
      code: "USTH",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Việt Pháp", "KCN", "Hoàng Quốc Việt"],
      areaKeys: [],
      roomMatchTerms: ["usth", "viet phap"]
    },
    {
      id: "hnue",
      name: "Trường Đại học Sư phạm Hà Nội",
      code: "HNUE",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Sư phạm Hà Nội", "SPH", "Xuân Thủy"],
      areaKeys: [],
      roomMatchTerms: ["su pham ha noi", "hnue"]
    },
    {
      id: "hnmu",
      name: "Trường Đại học Thủ đô Hà Nội",
      code: "HNMU",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Thủ đô Hà Nội", "Dương Quảng Hàm"],
      areaKeys: [],
      roomMatchTerms: ["thu do ha noi", "hnmu"]
    },
    {
      id: "nuae",
      name: "Trường Đại học Sư phạm Nghệ thuật Trung ương",
      code: "NUAE",
      city: "Hà Nội",
      district: "Quận Thanh Xuân",
      aliases: ["Sư phạm Nghệ thuật Trung ương", "GNT", "Nguyễn Trãi"],
      areaKeys: [],
      roomMatchTerms: ["su pham nghe thuat", "nuae"]
    },
    {
      id: "hupes",
      name: "Trường Đại học Sư phạm Thể dục Thể thao Hà Nội",
      code: "HUPES",
      city: "Hà Nội",
      district: "Huyện Chương Mỹ",
      aliases: ["Sư phạm TDTT Hà Nội", "SVT", "Phụng Châu"],
      areaKeys: [],
      roomMatchTerms: ["su pham the duc the thao ha noi", "hupes"]
    },
    {
      id: "hmu",
      name: "Trường Đại học Y Hà Nội",
      code: "HMU",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Y Hà Nội", "YHB", "Tôn Thất Tùng"],
      areaKeys: [],
      roomMatchTerms: ["y ha noi", "hmu"]
    },
    {
      id: "hup",
      name: "Trường Đại học Dược Hà Nội",
      code: "HUP",
      city: "Hà Nội",
      district: "Quận Hoàn Kiếm",
      aliases: ["Dược Hà Nội", "DKH", "Lê Thánh Tông"],
      areaKeys: [],
      roomMatchTerms: ["duoc ha noi", "hup"]
    },
    {
      id: "huph",
      name: "Trường Đại học Y tế Công cộng",
      code: "HUPH",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm",
      aliases: ["Y tế Công cộng", "YTC", "Đức Thắng"],
      areaKeys: [],
      roomMatchTerms: ["y te cong cong", "huph"]
    },
    {
      id: "hou",
      name: "Trường Đại học Mở Hà Nội",
      code: "HOU",
      city: "Hà Nội",
      district: "Quận Hai Bà Trưng · Hoàng Mai",
      aliases: ["Mở Hà Nội", "MHN", "Nguyễn Hiền"],
      areaKeys: [],
      roomMatchTerms: ["mo ha noi", "hou"]
    },
    {
      id: "huc",
      name: "Trường Đại học Văn hóa Hà Nội",
      code: "HUC",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Văn hóa Hà Nội", "VHH", "Đê La Thành"],
      areaKeys: [],
      roomMatchTerms: ["van hoa ha noi", "huc"]
    },
    {
      id: "mtc",
      name: "Trường Đại học Mỹ thuật Công nghiệp",
      code: "MTC",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Mỹ thuật Công nghiệp", "Đê La Thành"],
      areaKeys: [],
      roomMatchTerms: ["my thuat cong nghiep", "mtc"]
    },
    {
      id: "vnufa",
      name: "Trường Đại học Mỹ thuật Việt Nam",
      code: "VNUFA",
      city: "Hà Nội",
      district: "Quận Hai Bà Trưng",
      aliases: ["Mỹ thuật Việt Nam", "Yết Kiêu", "MTH"],
      areaKeys: [],
      roomMatchTerms: ["my thuat viet nam", "vnufa"]
    },
    {
      id: "skda-hn",
      name: "Trường Đại học Sân khấu - Điện ảnh Hà Nội",
      code: "SKDA",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Sân khấu Điện ảnh Hà Nội", "SKD", "Mai Dịch"],
      areaKeys: [],
      roomMatchTerms: ["san khau dien anh ha noi", "skda"]
    },
    {
      id: "hunre",
      name: "Trường Đại học Tài nguyên và Môi trường Hà Nội",
      code: "HUNRE",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm",
      aliases: ["Tài nguyên Môi trường Hà Nội", "DMT", "Phú Diễn"],
      areaKeys: [],
      roomMatchTerms: ["tai nguyen va moi truong ha noi", "hunre"]
    },
    {
      id: "vnuf",
      name: "Trường Đại học Lâm nghiệp",
      code: "VNUF",
      city: "Hà Nội",
      district: "Huyện Chương Mỹ (Xuân Mai)",
      aliases: ["Lâm nghiệp", "LNH", "Xuân Mai"],
      areaKeys: [],
      roomMatchTerms: ["lam nghiep", "vnuf"]
    },

    // --- Các Học viện tại Hà Nội ---
    {
      id: "aof",
      name: "Học viện Tài chính",
      code: "AOF",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm",
      aliases: ["Tài chính", "HVTC", "HTC", "Đức Thắng"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien tai chinh", "aof", "hvtc"]
    },
    {
      id: "bav",
      name: "Học viện Ngân hàng",
      code: "BAV",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["HVNH", "Ngân hàng", "BA", "NHH", "Chùa Bộc"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien ngan hang", "hvnh", "bav"]
    },
    {
      id: "dav",
      name: "Học viện Ngoại giao",
      code: "DAV",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Ngoại giao", "HQT", "Chùa Láng"],
      areaKeys: [],
      roomMatchTerms: ["ngoai giao", "dav"]
    },
    {
      id: "ajc",
      name: "Học viện Báo chí và Tuyên truyền",
      code: "AJC",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Báo chí Tuyên truyền", "TGC", "Xuân Thủy"],
      areaKeys: [],
      roomMatchTerms: ["bao chi", "ajc"]
    },
    {
      id: "ptit",
      name: "Học viện Công nghệ Bưu chính Viễn thông",
      code: "PTIT",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Bưu chính Viễn thông", "BVH", "Nguyễn Trãi"],
      areaKeys: [],
      roomMatchTerms: ["ptit", "buu chinh vien thong"]
    },
    {
      id: "kma",
      name: "Học viện Kỹ thuật Mật mã",
      code: "KMA",
      city: "Hà Nội",
      district: "Quận Thanh Xuân · Thanh Trì",
      aliases: ["Mật mã", "ACTVN", "Chiến Thắng"],
      areaKeys: [],
      roomMatchTerms: ["ky thuat mat ma", "kma"]
    },
    {
      id: "vnua",
      name: "Học viện Nông nghiệp Việt Nam",
      code: "VNUA",
      city: "Hà Nội",
      district: "Huyện Gia Lâm (Trâu Quỳ)",
      aliases: ["Nông nghiệp Việt Nam", "Nông nghiệp 1", "HVN", "Trâu Quỳ"],
      areaKeys: [],
      roomMatchTerms: ["nong nghiep viet nam", "vnua"]
    },
    {
      id: "apd",
      name: "Học viện Chính sách và Phát triển",
      code: "APD",
      city: "Hà Nội",
      district: "Huyện Hoài Đức",
      aliases: ["Chính sách Phát triển", "HCP", "Nam An Khánh"],
      areaKeys: [],
      roomMatchTerms: ["chinh sach va phat trien", "apd"]
    },
    {
      id: "napa",
      name: "Học viện Hành chính và Quản trị công",
      code: "APAG",
      city: "Hà Nội",
      district: "Quận Đống Đa · Bắc Từ Liêm",
      aliases: ["Học viện Hành chính Quốc gia", "NAPA", "ĐH Nội vụ Hà Nội", "HCH", "Nguyễn Chí Thanh"],
      areaKeys: [],
      roomMatchTerms: ["hanh chinh", "apag", "napa", "noi vu ha noi"]
    },
    {
      id: "naem",
      name: "Học viện Quản lý Giáo dục",
      code: "NAEM",
      city: "Hà Nội",
      district: "Quận Thanh Xuân",
      aliases: ["Quản lý Giáo dục", "HVQ", "Phan Đình Giót"],
      areaKeys: [],
      roomMatchTerms: ["quan ly giao duc", "naem"]
    },
    {
      id: "vwa",
      name: "Học viện Phụ nữ Việt Nam",
      code: "VWA",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Phụ nữ Việt Nam", "HPN", "Nguyễn Chí Thanh"],
      areaKeys: [],
      roomMatchTerms: ["phu nu viet nam", "vwa"]
    },
    {
      id: "vya",
      name: "Học viện Thanh thiếu niên Việt Nam",
      code: "VYA",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Thanh thiếu niên", "HTN", "Chùa Láng"],
      areaKeys: [],
      roomMatchTerms: ["thanh thieu nien", "vya"]
    },
    {
      id: "vca",
      name: "Học viện Tòa án",
      code: "VCA",
      city: "Hà Nội",
      district: "Huyện Gia Lâm",
      aliases: ["Tòa án", "HTA", "Kim Sơn"],
      areaKeys: [],
      roomMatchTerms: ["toa an", "vca"]
    },
    {
      id: "vutm",
      name: "Học viện Y Dược học cổ truyền Việt Nam",
      code: "VUTM",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Y Dược học cổ truyền", "HYD", "Trần Phú"],
      areaKeys: [],
      roomMatchTerms: ["y duoc hoc co truyen", "vutm"]
    },
    {
      id: "vnam",
      name: "Học viện Âm nhạc Quốc gia Việt Nam",
      code: "VNAM",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Âm nhạc Quốc gia", "Nhạc viện Hà Nội", "NVH", "Hào Nam"],
      areaKeys: [],
      roomMatchTerms: ["am nhac quoc gia", "vnam"]
    },
    {
      id: "vnad",
      name: "Học viện Múa Việt Nam",
      code: "VNAD",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Múa Việt Nam", "HVM", "Mai Dịch"],
      areaKeys: [],
      roomMatchTerms: ["mua viet nam", "vnad"]
    },
    {
      id: "hcma",
      name: "Học viện Chính trị Quốc gia Hồ Chí Minh",
      code: "HCMA",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Chính trị Quốc gia Hồ Chí Minh", "Nguyễn Phong Sắc"],
      areaKeys: [],
      roomMatchTerms: ["chinh tri quoc gia", "hcma"]
    },
    {
      id: "gass",
      name: "Học viện Khoa học Xã hội",
      code: "GASS",
      city: "Hà Nội",
      district: "Quận Thanh Xuân",
      aliases: ["Khoa học Xã hội", "Nguyễn Trãi"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien khoa hoc xa hoi"]
    },
    {
      id: "vaem",
      name: "Học viện Dân tộc",
      code: "VAEM",
      city: "Hà Nội",
      district: "Quận Nam Từ Liêm",
      aliases: ["Dân tộc"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien dan toc"]
    },
    {
      id: "hvtp-hn",
      name: "Học viện Tư pháp",
      code: "HVTP",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Tư pháp Hà Nội", "Trần Vỹ"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien tu phap"]
    },
    {
      id: "vba-hn",
      name: "Học viện Phật giáo Việt Nam tại Hà Nội",
      code: "VBA-HN",
      city: "Hà Nội",
      district: "Huyện Sóc Sơn",
      aliases: ["Phật giáo Hà Nội", "Sóc Sơn"],
      areaKeys: [],
      roomMatchTerms: ["phat giao"]
    },

    // --- Khối Quân đội & Công an tại Hà Nội ---
    {
      id: "mta",
      name: "Học viện Kỹ thuật Quân sự",
      code: "MTA",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm",
      aliases: ["Kỹ thuật Quân sự", "Đại học Lê Quý Đôn", "KQH", "Hoàng Quốc Việt"],
      areaKeys: [],
      roomMatchTerms: ["ky thuat quan su", "mta"]
    },
    {
      id: "vmmu",
      name: "Học viện Quân y",
      code: "VMMU",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Quân y", "YQH", "Phùng Hưng"],
      areaKeys: [],
      roomMatchTerms: ["quan y", "vmmu"]
    },
    {
      id: "msa",
      name: "Học viện Khoa học Quân sự",
      code: "MSA",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm",
      aliases: ["Khoa học Quân sự", "NQH"],
      areaKeys: [],
      roomMatchTerms: ["khoa hoc quan su", "msa"]
    },
    {
      id: "als",
      name: "Học viện Hậu cần",
      code: "ALS",
      city: "Hà Nội",
      district: "Quận Long Biên",
      aliases: ["Hậu cần", "HEH", "Ngọc Thụy"],
      areaKeys: [],
      roomMatchTerms: ["hau can", "als"]
    },
    {
      id: "hvct",
      name: "Học viện Chính trị (Bộ Quốc phòng)",
      code: "HVCT",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Chính trị Quân sự", "Quang Trung Hà Đông"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien chinh tri"]
    },
    {
      id: "hvqp",
      name: "Học viện Quốc phòng",
      code: "HVQP",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Quốc phòng", "Hoàng Quốc Việt"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien quoc phong"]
    },
    {
      id: "pkkq",
      name: "Học viện Phòng không - Không quân",
      code: "PKKQ",
      city: "Hà Nội",
      district: "Thị xã Sơn Tây",
      aliases: ["Phòng không Không quân", "PKH"],
      areaKeys: [],
      roomMatchTerms: ["phong khong khong quan"]
    },
    {
      id: "bph",
      name: "Học viện Biên phòng",
      code: "BPH",
      city: "Hà Nội",
      district: "Thị xã Sơn Tây",
      aliases: ["Biên phòng"],
      areaKeys: [],
      roomMatchTerms: ["bien phong"]
    },
    {
      id: "sqlq1",
      name: "Trường Đại học Trần Quốc Tuấn (Trường Sĩ quan Lục quân 1)",
      code: "LAH",
      city: "Hà Nội",
      district: "Thị xã Sơn Tây",
      aliases: ["Trần Quốc Tuấn", "Sĩ quan Lục quân 1", "Lục quân 1"],
      areaKeys: [],
      roomMatchTerms: ["tran quoc tuan", "luc quan 1"]
    },
    {
      id: "muca",
      name: "Trường Đại học Văn hóa Nghệ thuật Quân đội",
      code: "MUCA",
      city: "Hà Nội",
      district: "Quận Đống Đa",
      aliases: ["Văn hóa Nghệ thuật Quân đội", "ZNH", "Nguyễn Chí Thanh"],
      areaKeys: [],
      roomMatchTerms: ["nghe thuat quan doi", "muca"]
    },
    {
      id: "psa",
      name: "Học viện An ninh Nhân dân",
      code: "PSA",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["An ninh Nhân dân", "C500", "ANH", "Trần Phú"],
      areaKeys: [],
      roomMatchTerms: ["an ninh nhan dan", "psa"]
    },
    {
      id: "ppa",
      name: "Học viện Cảnh sát Nhân dân",
      code: "PPA",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm",
      aliases: ["Cảnh sát Nhân dân", "T02", "CSH", "Cổ Nhuế"],
      areaKeys: [],
      roomMatchTerms: ["canh sat nhan dan", "ppa"]
    },
    {
      id: "hvct-cand",
      name: "Học viện Chính trị Công an Nhân dân",
      code: "CAH",
      city: "Hà Nội",
      district: "Huyện Sóc Sơn",
      aliases: ["Chính trị Công an", "T03"],
      areaKeys: [],
      roomMatchTerms: ["chinh tri cong an"]
    },
    {
      id: "hvktcnan",
      name: "Học viện Kỹ thuật và Công nghệ An ninh",
      code: "KTH",
      city: "Hà Nội",
      district: "Thạch Thất (Hòa Lạc)",
      aliases: ["Kỹ thuật và Công nghệ An ninh", "ĐH Kỹ thuật Hậu cần CAND"],
      areaKeys: [],
      roomMatchTerms: ["cong nghe an ninh"]
    },
    {
      id: "ufp",
      name: "Trường Đại học Phòng cháy Chữa cháy",
      code: "UFP",
      city: "Hà Nội",
      district: "Quận Thanh Xuân",
      aliases: ["Phòng cháy Chữa cháy", "PCCC", "PCH", "Khuất Duy Tiến"],
      areaKeys: [],
      roomMatchTerms: ["phong chay chua chay", "pccc"]
    },
    {
      id: "hvqt-bca",
      name: "Học viện Quốc tế (Bộ Công an)",
      code: "HVQT-BCA",
      city: "Hà Nội",
      district: "Quận Nam Từ Liêm",
      aliases: ["Học viện Quốc tế Bộ Công an"],
      areaKeys: [],
      roomMatchTerms: ["hoc vien quoc te"]
    },

    // --- Các Trường Đại học Tư thục & Quốc tế tại Hà Nội ---
    {
      id: "fpt-hn",
      name: "Trường Đại học FPT Hà Nội",
      code: "FPTU-HN",
      city: "Hà Nội",
      district: "Thạch Thất (Khu CNC Hòa Lạc)",
      aliases: ["FPT Hà Nội", "FPTU", "Hòa Lạc"],
      areaKeys: [],
      roomMatchTerms: ["fpt ha noi", "hoa lac"]
    },
    {
      id: "phenikaa",
      name: "Trường Đại học Phenikaa",
      code: "PKA",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Phenikaa", "Yên Nghĩa"],
      areaKeys: [],
      roomMatchTerms: ["phenikaa"]
    },
    {
      id: "vinuni",
      name: "Trường Đại học VinUniversity",
      code: "VinUni",
      city: "Hà Nội",
      district: "Huyện Gia Lâm (Vinhomes Ocean Park)",
      aliases: ["VinUni", "Vin University", "Ocean Park"],
      areaKeys: [],
      roomMatchTerms: ["vinuni", "vinuniversity"]
    },
    {
      id: "tlu-thanglong",
      name: "Trường Đại học Thăng Long",
      code: "TLU-HN",
      city: "Hà Nội",
      district: "Quận Hoàng Mai",
      aliases: ["Thăng Long", "DTL", "Nghiêm Xuân Yêm"],
      areaKeys: [],
      roomMatchTerms: ["thang long"]
    },
    {
      id: "cmc",
      name: "Trường Đại học CMC",
      code: "CMC",
      city: "Hà Nội",
      district: "Quận Hà Đông · Quận Cầu Giấy",
      aliases: ["Đại học CMC", "Vạn Phúc"],
      areaKeys: [],
      roomMatchTerms: ["cmc"]
    },
    {
      id: "dnu",
      name: "Trường Đại học Đại Nam",
      code: "DNU",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Đại Nam", "DDN", "Phú Lãm"],
      areaKeys: [],
      roomMatchTerms: ["dai nam", "dnu"]
    },
    {
      id: "hubt",
      name: "Trường Đại học Kinh doanh và Công nghệ Hà Nội",
      code: "HUBT",
      city: "Hà Nội",
      district: "Quận Hai Bà Trưng",
      aliases: ["Kinh doanh và Công nghệ", "DQK", "Vĩnh Tuy"],
      areaKeys: [],
      roomMatchTerms: ["kinh doanh va cong nghe", "hubt"]
    },
    {
      id: "pdu",
      name: "Trường Đại học Phương Đông",
      code: "PDU",
      city: "Hà Nội",
      district: "Quận Cầu Giấy · Hoàng Mai",
      aliases: ["Phương Đông", "DPD", "Trung Kính"],
      areaKeys: [],
      roomMatchTerms: ["phuong dong", "pdu"]
    },
    {
      id: "ddu",
      name: "Trường Đại học Đông Đô",
      code: "DDU",
      city: "Hà Nội",
      district: "Quận Hoàng Mai · Thanh Xuân",
      aliases: ["Đông Đô", "DDD"],
      areaKeys: [],
      roomMatchTerms: ["dong do", "ddu"]
    },
    {
      id: "tdu",
      name: "Trường Đại học Thành Đô",
      code: "TDU",
      city: "Hà Nội",
      district: "Huyện Hoài Đức",
      aliases: ["Thành Đô", "TDD", "Kim Chung"],
      areaKeys: [],
      roomMatchTerms: ["thanh do", "tdu"]
    },
    {
      id: "hbu",
      name: "Trường Đại học Hòa Bình",
      code: "HBU",
      city: "Hà Nội",
      district: "Quận Nam Từ Liêm",
      aliases: ["Hòa Bình", "ETU", "Mỹ Đình"],
      areaKeys: [],
      roomMatchTerms: ["dai hoc hoa binh", "hbu"]
    },
    {
      id: "ntu-hn",
      name: "Trường Đại học Nguyễn Trãi",
      code: "NTU",
      city: "Hà Nội",
      district: "Quận Hà Đông",
      aliases: ["Nguyễn Trãi"],
      areaKeys: [],
      roomMatchTerms: ["dai hoc nguyen trai"]
    },
    {
      id: "eaut",
      name: "Trường Đại học Công nghệ Đông Á",
      code: "EAUT",
      city: "Hà Nội",
      district: "Quận Nam Từ Liêm",
      aliases: ["Công nghệ Đông Á", "DDA", "Trịnh Văn Bô"],
      areaKeys: [],
      roomMatchTerms: ["cong nghe dong a", "eaut"]
    },
    {
      id: "utm",
      name: "Trường Đại học Công nghệ và Quản lý Hữu nghị",
      code: "UTM",
      city: "Hà Nội",
      district: "Quận Hoàng Mai",
      aliases: ["Quản lý Hữu nghị", "DCQ", "Minh Khai"],
      areaKeys: [],
      roomMatchTerms: ["huu nghi", "utm"]
    },
    {
      id: "fbu",
      name: "Trường Đại học Tài chính - Ngân hàng Hà Nội",
      code: "FBU",
      city: "Hà Nội",
      district: "Quận Bắc Từ Liêm · Mê Linh",
      aliases: ["Tài chính Ngân hàng Hà Nội", "Dịch Vọng Hậu"],
      areaKeys: [],
      roomMatchTerms: ["tai chinh ngan hang ha noi", "fbu"]
    },
    {
      id: "bhiu",
      name: "Trường Đại học Quốc tế Bắc Hà",
      code: "BHIU",
      city: "Hà Nội",
      district: "Quận Cầu Giấy · Bắc Ninh",
      aliases: ["Quốc tế Bắc Hà"],
      areaKeys: [],
      roomMatchTerms: ["bac ha", "bhiu"]
    },
    {
      id: "rmit-hn",
      name: "Đại học RMIT Việt Nam - Cơ sở Hà Nội",
      code: "RMIT-HN",
      city: "Hà Nội",
      district: "Quận Ba Đình",
      aliases: ["RMIT Hà Nội", "Kim Mã"],
      areaKeys: [],
      roomMatchTerms: ["rmit ha noi"]
    },
    {
      id: "buv",
      name: "Trường Đại học Anh Quốc Việt Nam",
      code: "BUV",
      city: "Hà Nội",
      district: "Khu vực Ecopark (Đông Nam Hà Nội)",
      aliases: ["British University Vietnam", "Anh Quốc Việt Nam", "Ecopark"],
      areaKeys: [],
      roomMatchTerms: ["buv", "anh quoc viet nam"]
    },
    {
      id: "greenwich-hn",
      name: "Đại học Greenwich Việt Nam - Cơ sở Hà Nội",
      code: "Greenwich-HN",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Greenwich Hà Nội", "Phạm Văn Bạch"],
      areaKeys: [],
      roomMatchTerms: ["greenwich ha noi"]
    },
    {
      id: "swinburne-hn",
      name: "Swinburne Việt Nam - Cơ sở Hà Nội",
      code: "Swinburne-HN",
      city: "Hà Nội",
      district: "Quận Cầu Giấy",
      aliases: ["Swinburne Hà Nội", "Dương Khuê"],
      areaKeys: [],
      roomMatchTerms: ["swinburne ha noi"]
    }
  ];

  // Danh sách toàn bộ các quận (và TP. Thủ Đức) tại TP.HCM & Hà Nội
  window.RoomieData.DISTRICTS_BY_CITY = {
    "TP.HCM": [
      { key: "quan-1", name: "Quận 1" },
      { key: "quan-3", name: "Quận 3" },
      { key: "quan-4", name: "Quận 4" },
      { key: "quan-5", name: "Quận 5" },
      { key: "quan-6", name: "Quận 6" },
      { key: "quan-7", name: "Quận 7" },
      { key: "quan-8", name: "Quận 8" },
      { key: "quan-10", name: "Quận 10" },
      { key: "quan-11", name: "Quận 11" },
      { key: "quan-12", name: "Quận 12" },
      { key: "binh-tan", name: "Quận Bình Tân" },
      { key: "binh-thanh", name: "Quận Bình Thạnh" },
      { key: "go-vap", name: "Quận Gò Vấp" },
      { key: "phu-nhuan", name: "Quận Phú Nhuận" },
      { key: "tan-binh", name: "Quận Tân Bình" },
      { key: "tan-phu", name: "Quận Tân Phú" },
      { key: "thu-duc", name: "TP. Thủ Đức / ĐHQG" }
    ],
    "Hà Nội": [
      { key: "ba-dinh", name: "Quận Ba Đình" },
      { key: "bac-tu-liem", name: "Quận Bắc Từ Liêm" },
      { key: "cau-giay", name: "Quận Cầu Giấy" },
      { key: "dong-da", name: "Quận Đống Đa" },
      { key: "ha-dong", name: "Quận Hà Đông" },
      { key: "hai-ba-trung", name: "Quận Hai Bà Trưng" },
      { key: "hoan-kiem", name: "Quận Hoàn Kiếm" },
      { key: "hoang-mai", name: "Quận Hoàng Mai" },
      { key: "long-bien", name: "Quận Long Biên" },
      { key: "nam-tu-liem", name: "Quận Nam Từ Liêm" },
      { key: "tay-ho", name: "Quận Tây Hồ" },
      { key: "thanh-xuan", name: "Quận Thanh Xuân" }
    ]
  };
})();
