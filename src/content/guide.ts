// "Find your kind of weekend" tiles on the homepage. Each one points guests to the
// home or page that fits that trip best.
export const tripStyles: { title: string; blurb: string; href: string; icon: string; tone: string }[] = [
  { title: "Golf weekend", blurb: "A private 4-hole putting green out the back door.", href: "/stays/ironwood-acres", icon: "⛳", tone: "from-[#1f3a2e] to-[#3d6b4f]" },
  { title: "Family reunion", blurb: "Five bedrooms and a 12-seat table that fits everyone.", href: "/stays/ironwood-acres", icon: "🏡", tone: "from-[#5a3a22] to-[#b08d57]" },
  { title: "Girls' trip", blurb: "Hot tub, wine trail, and a fire pit for late talks.", href: "/experiences", icon: "🥂", tone: "from-[#7a3b3b] to-[#d9774b]" },
  { title: "Striper fishing", blurb: "Guides, early mornings, and a grill for the catch.", href: "/experiences", icon: "🎣", tone: "from-[#123543] to-[#1f4e5f]" },
  { title: "Lake views", blurb: "Glass walls, a plunge pool, and the sunset over the water.", href: "/stays/the-overlook", icon: "🌅", tone: "from-[#2a3a48] to-[#7fa7b3]" },
  { title: "Game night", blurb: "Poker for 8, foosball, and an 85\" screen.", href: "/stays/ironwood-acres", icon: "🃏", tone: "from-[#14202b] to-[#2a3a48]" },
];

// Area guide highlights on the homepage.
export const areaGuide: { category: string; place: string; note: string }[] = [
  { category: "On the water", place: "Highport Marina", note: "Launch, slips and lake access, about 2 miles from Ironwood Acres." },
  { category: "Fishing", place: "Striper country", note: "Lake Texoma is famous for striped bass. We'll connect you with a guide." },
  { category: "Outdoors", place: "Eisenhower State Park", note: "Bluffs, trails and swimming coves on the lake's Texas shore." },
  { category: "Wildlife", place: "Hagerman Refuge", note: "Birding trails and huge flocks of migrating geese in winter." },
  { category: "Town", place: "Downtown Denison", note: "Historic Main Street with wine rooms, galleries and dinner spots." },
  { category: "Nightlife", place: "Choctaw Casino & Resort", note: "Shows and dining just across the Red River in Durant, Oklahoma." },
];
