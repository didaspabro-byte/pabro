import { Product, ProductReview } from './types';

export const products: Product[] = [
  {
    id: 'prod_tecno_pop_20',
    name: 'Tecno Pop 20',
    description: 'The high-efficiency Tecno Pop 20 delivers streamlined, beautiful daily utility. Features an ultra-slim modern bezel, durable battery system, and an elegant tactile finish.',
    price: 450000,
    category: 'Minimalist Tech',
    rating: 4.7,
    reviewsCount: 62,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700&auto=format&fit=crop&q=80',
    features: [
      '6.6-inch Fluid IPS Display',
      '4500mAh High-Performance Battery',
      'Sleek Minimalist Unibody Form',
      'Dual-Camera System with Auto-Focus',
      'Optimized Light-OS with High Efficiency'
    ],
    colors: ['Obsidian Black', 'Polar White', 'Sunset Gold']
  },
  {
    id: 'prod_1',
    name: 'Aura Wireless Headphones',
    description: 'Immersive soundscapes with active intelligence noise isolation, 40-hour battery runtime, and premium memory foam cushioning.',
    price: 1110000,
    category: 'Minimalist Tech',
    rating: 4.8,
    reviewsCount: 124,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    features: [
      'Active Noise Cancellation (ANC)',
      'High-Resolution Audio Drivers',
      '40-hour Battery with Fast Charge',
      'Ergonomic Leatherette Cushions',
      'Bluetooth 5.2 & Multipoint Connection'
    ],
    colors: ['Obsidian Black', 'Chalk White', 'Nordic Blue']
  },
  {
    id: 'prod_2',
    name: 'Vista Chronograph Smartwatch',
    description: 'A striking fusion of analog elegance and digital utility. Features offline metrics, heart monitoring, and 14-day standby.',
    price: 700000,
    category: 'Minimalist Tech',
    rating: 4.6,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80',
    features: [
      'Always-On AMOLED Display',
      'Bio-Sensor Hub (Heart Rate & SpO2)',
      'Water-Resistant up to 50 Meters',
      'Customizable Watch Faces',
      'Machined Stainless Steel Case'
    ],
    colors: ['Silver', 'Space Gray', 'Champagne Gold']
  },
  {
    id: 'prod_3',
    name: 'Ergo Mechanical Keyboard',
    description: 'Anodized aluminum frame keyboard with hot-swappable tactile switches, double-shot keycaps, and customizable white backlight.',
    price: 540000,
    category: 'Minimalist Tech',
    rating: 4.9,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80',
    features: [
      'Anodized Aluminum Frame',
      'Hot-Swappable Gateron Brown Switches',
      'PBT Double-Shot Dye-Sub Keycaps',
      'USB-C Detachable Braided Cable',
      'Multi-Device Pairing (Wireless/Wired)'
    ],
    colors: ['Off-White', 'Graphite']
  },
  {
    id: 'prod_4',
    name: 'Seamless Merino Wool Hoodie',
    description: 'Spun from pure extrafine Australian Merino wool. Offers natural thermoregulation, wind shielding, and odor resistance.',
    price: 330000,
    category: 'Premium Apparel',
    rating: 4.7,
    reviewsCount: 84,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&auto=format&fit=crop&q=80',
    features: [
      '100% Extrafine Australian Merino Wool',
      'Naturally Odor-Resistant & Moisture-Wicking',
      'Seamless Form-Fitting Knit Construction',
      'Concealed Zipper Security Pockets',
      'Ribbed Thumbholes & Elastic Cuffs'
    ],
    colors: ['Sandstone', 'Charcoal', 'Forest Green'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_5',
    name: 'Commuter Field Backpack',
    description: 'Constructed from ballistic nylon with weather guard finishes. Thoughtful compartment layouts for active modern travel.',
    price: 440000,
    category: 'Premium Apparel',
    rating: 4.5,
    reviewsCount: 72,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80',
    features: [
      '1680D Ballistic Nylon Waterproofing',
      'Magnetic Quick-Access Utility Clasp',
      'Dedicated Felt-Lined 16" Laptop Pocket',
      'Orthopedic Breathable Mesh Backing',
      'Luggage Pass-Through Handle'
    ],
    colors: ['Midnight Black', 'Slate Grey']
  },
  {
    id: 'prod_6',
    name: 'Classic Trucker Jacket',
    description: 'Timeless denim silhouette crafted from organic heavyweight cotton. Finished with matte nickel button closures.',
    price: 430000,
    category: 'Premium Apparel',
    rating: 4.4,
    reviewsCount: 55,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=700&auto=format&fit=crop&q=80',
    features: [
      '14oz Rigid Organic Ring-Spun Cotton',
      'Traditional Multi-Pocket Design',
      'Double-Needle Reinforced Stitches',
      'Embossed Brass Clasping hardware',
      'Adjustable Side Waist Tabs'
    ],
    colors: ['Vintage Blue', 'Driftwood Brown'],
    sizes: ['M', 'L', 'XL']
  },
  {
    id: 'prod_7',
    name: 'Ceramic Matte Vase Set',
    description: 'A curated trio of organic clay vases featuring unique hand-thrown profiles, rough grit textures, and natural stoneware glazes.',
    price: 170000,
    category: 'Home & Wellness',
    rating: 4.7,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=700&auto=format&fit=crop&q=80',
    features: [
      'Set of Three Graduated Heights',
      'Sustainably Sourced Terracotta Clay',
      'Hand-Thrown Matted Finish Finish',
      'Waterproof Sealed Inner Base',
      'Anti-Scratch Silicon Bottom Felt Pads'
    ],
    unitCount: 3,
    unitName: 'vase'
  },
  {
    id: 'prod_8',
    name: 'Double-Walled Glassware Set',
    description: 'Expertly blown borosilicate glassware designed to capture hot and cold infusions suspended in heat-defending layers.',
    price: 135000,
    category: 'Home & Wellness',
    rating: 4.8,
    reviewsCount: 61,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&auto=format&fit=crop&q=80',
    features: [
      'Pack of Four 12oz Suspended Tumblers',
      'Lightweight Thermal Borosilicate Glass',
      'Condensation-Free Structural Design',
      'Microwave and Top-Rack Dishwasher Safe',
      'Comfort-Grip Ergonomic Curves'
    ],
    unitCount: 4,
    unitName: 'glass'
  },
  {
    id: 'prod_9',
    name: 'Eucalyptus Lounge Bedding',
    description: 'Made from organic eucalyptus lyocell fibers. Silk-soft cooling fabrics configured to naturally deflect warmth.',
    price: 590000,
    category: 'Home & Wellness',
    rating: 4.9,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=700&auto=format&fit=crop&q=80',
    features: [
      '300 Thread Count Lyocell (Eucalyptus)',
      'Excellent Thermal Control Cooling Touch',
      'Hypoallergenic Fibers Shield Sensitive Skin',
      'Includes 1 Fitted Sheet & 2 Pillowcases',
      'OEKO-TEX Certified Chemical-Free Process'
    ],
    colors: ['Ocean Mist', 'Alabaster White', 'Earthy Sage'],
    sizes: ['Queen', 'King']
  },
  {
    id: 'prod_10',
    name: 'Insulated Stainless Flask',
    description: 'Pro-grade stainless steel bottle. Dual-shield vacuum locks temperatures, securing ice for 24 hours or warmth for 12.',
    price: 120000,
    category: 'Sports & Gear',
    rating: 4.8,
    reviewsCount: 184,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop&q=80',
    features: [
      '18/8 Professional-Grade Stainless Steel',
      'Double-Wall Vacuum Insulation Seal',
      'Durable Exterior Sweat-Proof Powder Coat',
      'Leakproof Loop Lid for Carabiner Clasp',
      'BPA-Free, Phthalate-Free Safety Checked'
    ],
    colors: ['Onyx Matte', 'Arctic White', 'Pacific Green']
  },
  {
    id: 'prod_11',
    name: 'Carbon Fiber Trekking Poles',
    description: 'Ultralight structured carbon fiber shafts with quick-lock flick systems, anatomical cork hand grips, and EVA sleeves.',
    price: 295000,
    category: 'Sports & Gear',
    rating: 4.6,
    reviewsCount: 47,
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?w=700&auto=format&fit=crop&q=80',
    features: [
      'Weighed under 7.5oz Per Single Pole',
      '100% Responsive Carbon Fiber Shafts',
      'Anatomically Formed Real Cork Grip Handles',
      'Quick-Lock Aluminum Flick Lock Clamps',
      'Interchangeable Mud, Snow & Rock Tips'
    ]
  },
  {
    id: 'prod_12',
    name: 'Smart Resistance Band Loop Kit',
    description: 'Multi-strength latex bands paired with detailed exercise guides, anchors, and comfort neoprene grips.',
    price: 180000,
    category: 'Sports & Gear',
    rating: 4.7,
    reviewsCount: 75,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&auto=format&fit=crop&q=80',
    features: [
      'Five Custom Color-Coded Tension Bands',
      '100% Eco-Friendly Natural Latex Strips',
      'Reinforced Sweat-Proof Padded Neoprene Grips',
      'Durable Integrated Door Jam Anchor Bracket',
      'Premium Compact Nylon Storage Travel Mesh'
    ],
    unitCount: 5,
    unitName: 'band'
  },
  {
    id: 'prod_13',
    name: 'Premium Uganda Mountain Honey',
    description: '100% organic raw honey harvested from wild mountain flowers of Western Uganda. Pure, unfiltered, and packed with active wellness properties.',
    price: 35000,
    category: 'Organic Grocery',
    rating: 4.9,
    reviewsCount: 68,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&auto=format&fit=crop&q=80',
    features: [
      'Locally Harvested from Kigezi Hills',
      'Rich Wildflower Floral Flavor Profile',
      'Unpasteurized, Cold-Pressed and Unfiltered',
      'Zero Refined Sugars, Preservatives or Fillers'
    ],
    colors: ['Golden Amber', 'Dark Forest'],
    netWeightGram: 500
  },
  {
    id: 'prod_14',
    name: 'Rwenzori Highland Premium Oats',
    description: 'Slow-rolled, high-fiber heritage oats cultivated organically on mountain micro-farms. An energizing breakfast staple packed with vitamins.',
    price: 24000,
    category: 'Organic Grocery',
    rating: 4.7,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=700&auto=format&fit=crop&q=80',
    features: [
      '100% Organically Grown Whole Grain Oats',
      'High in Beta-Glucans and Vital Nutrients',
      'Excellent for Heart Health and Steady Energy',
      'Non-GMO Verified and Free of Added Sugars'
    ],
    colors: ['Original Rolled'],
    netWeightGram: 1000
  },
  {
    id: 'prod_15',
    name: 'Sipi Falls Handpicked Arabica Coffee',
    description: 'Superb medium-dark roast coffee beans grown at high elevations on Mount Elgon. Exquisite notes of sweet citrus, dark chocolate, and creamy caramel finish.',
    price: 65000,
    category: 'Beverages & Pantry',
    rating: 4.9,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=700&auto=format&fit=crop&q=80',
    features: [
      'Single-Origin 100% Specialty Arabica',
      'Direct-Trade Sourced and Eco-Friendly Farming',
      'Whole Beans Sealed Fresh to Guarantee Aroma',
      'Cultivated by Family Hubs at 1,800m Altitude'
    ],
    colors: ['Medium Roast', 'Dark Roast'],
    netWeightGram: 250
  },
  {
    id: 'prod_16',
    name: 'Premium Kampala Spiced Hibiscus Tea',
    description: 'A vibrant herbal tea blend using sun-dried hibiscus petals infused with warm ginger and indigenous aromatic spices of East Africa.',
    price: 18000,
    category: 'Beverages & Pantry',
    rating: 4.8,
    reviewsCount: 53,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80',
    features: [
      'Sun-Dried Hibiscus Petals and Fresh Ginger Root',
      'High in Immune-Supporting Antioxidants',
      'Caffeine-Free & Excellent Hot or Ice Brewed',
      'Rich, Fruity and Slightly Spiced Flavor Profile'
    ],
    colors: ['Classic Ruby Spiced'],
    netWeightGram: 100
  },
  {
    id: 'prod_17',
    name: 'Minimalist Lined Hardcover Journal',
    description: 'Beautifully bound book crafted with archival ink-proof ivory paper, dual silk ribbon markers, and a handy expander envelope pouch in the back cover.',
    price: 48000,
    category: 'Books & Stationery',
    rating: 4.9,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=700&auto=format&fit=crop&q=80',
    features: [
      '180 Numbered Pages of 120gsm Paper',
      'Faux-Leather Splash-Resistant Soft Cover',
      'Perfect-Bound Flat Lay Opening Mechanism',
      'Elastic Safety Strap and Rear Accessory Pocket'
    ],
    colors: ['Coal Matte Charcoal', 'Sisal Sage Green', 'Clay Dust Pink']
  },
  {
    id: 'prod_18',
    name: 'Elegant Brass Brass fountain Pen',
    description: 'Uniquely heavy raw brass writing instrument that develops a beautiful custom patina over time. Includes an alloy pocket clip.',
    price: 160000,
    category: 'Books & Stationery',
    rating: 4.6,
    reviewsCount: 31,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=80',
    features: [
      'Solid Machined Heavyweight Brass Barrel',
      'Precision Dual Ink Delivery System',
      'Includes Standard Ink Converter Cartridge',
      'Ergonomic Balance for Fatigue-Free Writing'
    ],
    colors: ['Vintage Polished Brass']
  }
];

export const productReviews: ProductReview[] = [
  // prod_1: Aura Wireless Headphones (rating: 4.8)
  {
    id: 'rev_1_1',
    productId: 'prod_1',
    userName: 'Kato Emmanuel',
    rating: 5,
    comment: 'Absolutely stunning soundscapes! The ANC is top-notch, blocking out all office noise. Battery life seems endless.',
    date: 'June 10, 2026'
  },
  {
    id: 'rev_1_2',
    productId: 'prod_1',
    userName: 'Aisha Namusoke',
    rating: 4,
    comment: 'Extremely comfortable memory foam pads. The sound signature is very clean, though I wished the bass had a tiny bit more punch.',
    date: 'May 28, 2026'
  },
  // prod_2: Vista Chronograph Smartwatch (rating: 4.6)
  {
    id: 'rev_2_1',
    productId: 'prod_2',
    userName: 'Brian Bwambale',
    rating: 5,
    comment: 'A masterful blend of analog look with digital metrics. The heart monitoring is highly responsive and the battery really lasts about two weeks!',
    date: 'June 05, 2026'
  },
  {
    id: 'rev_2_2',
    productId: 'prod_2',
    userName: 'Florence Nabakooza',
    rating: 4,
    comment: 'Beautiful metallic construction. Takes a little while to sync with some phone models initially, but works flawlessly once setup.',
    date: 'April 15, 2026'
  },
  // prod_3: Ergo Mechanical Keyboard (rating: 4.9)
  {
    id: 'rev_3_1',
    productId: 'prod_3',
    userName: 'Derrick Nsubuga',
    rating: 5,
    comment: 'The tactile feel of the switches is simply divine. Typing is effortless, and the weight of the anodized frame gives it a premium feel.',
    date: 'June 14, 2026'
  },
  {
    id: 'rev_3_2',
    productId: 'prod_3',
    userName: 'Grace Mirembe',
    rating: 5,
    comment: 'Gorgeous off-white minimalist vibe. Hot-swapping was super smooth, and the modern subtle white backlighting looks incredibly clean.',
    date: 'May 12, 2026'
  },
  // prod_4: Seamless Merino Wool Hoodie (rating: 4.7)
  {
    id: 'rev_4_1',
    productId: 'prod_4',
    userName: 'Michael Okello',
    rating: 5,
    comment: 'Unbelievably soft and is indeed odor-resistant. Worn it during long flights and commutes, still fresh. Fits perfectly!',
    date: 'June 02, 2026'
  },
  {
    id: 'rev_4_2',
    productId: 'prod_4',
    userName: 'Sandra Atwine',
    rating: 4,
    comment: 'Wonderful thermoregulation. Keeps me warm but doesn\'t make me sweat. Be careful with machine wash cycles though - follow instructions.',
    date: 'April 29, 2026'
  },
  // prod_5: Commuter Field Backpack (rating: 4.5)
  {
    id: 'rev_5_1',
    productId: 'prod_5',
    userName: 'Ivan Ssewankambo',
    rating: 4,
    comment: 'Very rugged ballistic nylon and highly secure. The magnetic lock takes a little getting used to but feels very premium.',
    date: 'June 09, 2026'
  },
  {
    id: 'rev_5_2',
    productId: 'prod_5',
    userName: 'Naomi Kyomugisha',
    rating: 5,
    comment: 'The orthopedic back mesh really helps with heavy loads. The felt-lined laptop compartment safeholds my 16" MacBook nicely.',
    date: 'May 03, 2026'
  },
  // prod_6: Classic Trucker Jacket (rating: 4.4)
  {
    id: 'rev_6_1',
    productId: 'prod_6',
    userName: 'Jonathan Mugisha',
    rating: 4,
    comment: 'Heavyweight, premium denim. Hard to find organic cotton quality like this nowadays. Fits slightly snug, consider sizing up.',
    date: 'May 19, 2026'
  },
  {
    id: 'rev_6_2',
    productId: 'prod_6',
    userName: 'Rachael Nakigozi',
    rating: 5,
    comment: 'A true classic silhouette. Matches virtually everything in my wardrobe. Sturdy brass-colored details.',
    date: 'April 10, 2026'
  },
  // prod_7: Ceramic Matte Vase Set (rating: 4.7)
  {
    id: 'rev_7_1',
    productId: 'prod_7',
    userName: 'Damalie Babirye',
    rating: 5,
    comment: 'Gorgeous clay profiles. They look highly artistic on my mantle. The sandy grit texture is incredibly tactile and modern.',
    date: 'June 11, 2026'
  },
  {
    id: 'rev_7_2',
    productId: 'prod_7',
    userName: 'Patricia Kirabo',
    rating: 4,
    comment: 'Minimalist stoneware. The silicone pads on the bottom are a saver so they don\'t scratch my mahogany shelves. Very satisfied.',
    date: 'March 22, 2026'
  },
  // prod_8: Double-Walled Glassware Set (rating: 4.8)
  {
    id: 'rev_8_1',
    productId: 'prod_8',
    userName: 'Arthur Kabonge',
    rating: 5,
    comment: 'Keeps my lattes hot and my fingers cool. Double-walled borosilicate is extremely lightweight but surprisingly durable.',
    date: 'June 13, 2026'
  },
  {
    id: 'rev_8_2',
    productId: 'prod_8',
    userName: 'Evelyn Namaganda',
    rating: 4,
    comment: 'Love the suspended liquid look. Always gets compliments from guests. They survive the dishwasher top rack easily.',
    date: 'May 07, 2026'
  },
  // prod_9: Eucalyptus Lounge Bedding (rating: 4.9)
  {
    id: 'rev_9_1',
    productId: 'prod_9',
    userName: 'Solomon Mukasa',
    rating: 5,
    comment: 'Feels like sleeping on silk clouds! This eucalyptus lyocell is remarkably cooling for hot tropical nights. Will buy a second set.',
    date: 'June 15, 2026'
  },
  {
    id: 'rev_9_2',
    productId: 'prod_9',
    userName: 'Diana Kembabazi',
    rating: 5,
    comment: 'Hypoallergenic, soft, and feels extremely luxurious. Fits our king mattress perfectly with deep sheet pockets. 10/10 recommend!',
    date: 'May 30, 2026'
  },
  // prod_10: Insulated Stainless Flask (rating: 4.8)
  {
    id: 'rev_10_1',
    productId: 'prod_10',
    userName: 'George Musisi',
    rating: 5,
    comment: 'Kept my ice solid for a whole day during a hike. Outstanding insulation and the loop lid makes it easy to carry with a carabiner.',
    date: 'June 08, 2026'
  },
  {
    id: 'rev_10_2',
    productId: 'prod_10',
    userName: 'Ritah Alupo',
    rating: 4,
    comment: 'Premium powder coat finish that doesn\'t chip. Solid build, totally sweat-proof on the outside. Does not leak at all.',
    date: 'May 20, 2026'
  },
  // prod_11: Carbon Fiber Trekking Poles (rating: 4.6)
  {
    id: 'rev_11_1',
    productId: 'prod_11',
    userName: 'Tendo Joseph',
    rating: 5,
    comment: 'Light as a feather! The cork handles feel highly ergonomic and soak sweat nicely, preventing hand slippage on steep descents.',
    date: 'June 01, 2026'
  },
  {
    id: 'rev_11_2',
    productId: 'prod_11',
    userName: 'Martha Akello',
    rating: 4,
    comment: 'Flick locks clamp solidly and haven\'t budged yet under pressure. Appreciate the extra snow baskets included in the set.',
    date: 'April 14, 2026'
  },
  // prod_12: Smart Resistance Band Loop Kit (rating: 4.7)
  {
    id: 'rev_12_1',
    productId: 'prod_12',
    userName: 'Nicholas Ochieng',
    rating: 5,
    comment: 'Very thick and durable natural latex. Neoprene handles are cushioned and comfy. Perfect homeworkout toolkit while travelling.',
    date: 'June 12, 2026'
  },
  {
    id: 'rev_12_2',
    productId: 'prod_12',
    userName: 'Phiona Nakafeero',
    rating: 4,
    comment: 'Excellent elasticity. The door jam anchor works beautifully, extending options for pull/push moves. Nice mesh bag.',
    date: 'May 15, 2026'
  }
];
