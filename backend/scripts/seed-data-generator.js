import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 1. BUSINESSES (10 Domain-Specific Storefronts)
// ============================================================================
export const BUSINESS_TEMPLATES = [
  {
    key: 'TECHCART',
    id: 'b0000000-0000-4000-8000-000000000001',
    name: 'TechCart Electronics',
    description: 'Premier distributor of pro audio gear, ergonomic workspace solutions, mechanical keyboards, and creator tech.',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    email: 'support@techcart.io',
    phone: '+1 (800) 555-0101',
    address: '500 Tech Valley Blvd, Suite 400, San Jose, CA 95110',
    profit_margin: 28.50,
    status: 'ACTIVE',
  },
  {
    key: 'HOMENEST',
    id: 'b0000000-0000-4000-8000-000000000002',
    name: 'HomeNest Living',
    description: 'Scandi-minimalist furniture, architectural lighting, eco-friendly kitchenware, and modern interior decor.',
    logo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80',
    email: 'hello@homenest.design',
    phone: '+1 (800) 555-0102',
    address: '120 Nordic Way, Fl 3, Seattle, WA 98101',
    profit_margin: 32.00,
    status: 'ACTIVE',
  },
  {
    key: 'PETCARE',
    id: 'b0000000-0000-4000-8000-000000000003',
    name: 'PetCare Hub',
    description: 'Holistic pet nutrition, automated feeders, smart tracking collars, and ergonomic pet furniture.',
    logo: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&auto=format&fit=crop&q=80',
    email: 'care@petcarehub.com',
    phone: '+1 (800) 555-0103',
    address: '88 Barker Ave, Austin, TX 78701',
    profit_margin: 35.00,
    status: 'ACTIVE',
  },
  {
    key: 'STYLEMART',
    id: 'b0000000-0000-4000-8000-000000000004',
    name: 'StyleMart Apparel',
    description: 'Sustainable urban activewear, minimalist outerwear, handcrafted leather goods, and premium footwear.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80',
    email: 'concierge@stylemart.co',
    phone: '+1 (800) 555-0104',
    address: '742 Fashion Ave, New York, NY 10018',
    profit_margin: 40.00,
    status: 'ACTIVE',
  },
  {
    key: 'KITCHENKART',
    id: 'b0000000-0000-4000-8000-000000000005',
    name: 'KitchenKart Essentials',
    description: 'Pro-grade cookware, precision espresso machines, sous-vide circulators, and culinary gadgets.',
    logo: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80',
    email: 'orders@kitchenkart.com',
    phone: '+1 (800) 555-0105',
    address: '310 Culinary Way, Chicago, IL 60611',
    profit_margin: 30.00,
    status: 'ACTIVE',
  },
  {
    key: 'FITNESSZONE',
    id: 'b0000000-0000-4000-8000-000000000006',
    name: 'FitnessZone Gear',
    description: 'Commercial dumbbell sets, high-tech massage guns, smart biometric bands, and mobility gear.',
    logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    email: 'support@fitnesszone.fit',
    phone: '+1 (800) 555-0106',
    address: '950 Muscle Beach Blvd, Santa Monica, CA 90401',
    profit_margin: 33.50,
    status: 'ACTIVE',
  },
  {
    key: 'GADGETWORLD',
    id: 'b0000000-0000-4000-8000-000000000007',
    name: 'GadgetWorld Global',
    description: 'Smart home IoT hubs, 4K camera drones, magnetic wireless stations, and solar energy generators.',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    email: 'info@gadgetworld.net',
    phone: '+1 (800) 555-0107',
    address: '101 Innovation Way, Boulder, CO 80301',
    profit_margin: 26.00,
    status: 'ACTIVE',
  },
  {
    key: 'BEAUTYBASKET',
    id: 'b0000000-0000-4000-8000-000000000008',
    name: 'BeautyBasket Organics',
    description: 'Clean cruelty-free skincare, botanical hair elixirs, jade facial rollers, and organic cosmetics.',
    logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80',
    email: 'support@beautybasket.org',
    phone: '+1 (800) 555-0108',
    address: '45 Lotus Lane, Miami, FL 33139',
    profit_margin: 45.00,
    status: 'ACTIVE',
  },
  {
    key: 'AUTOESSENTIALS',
    id: 'b0000000-0000-4000-8000-000000000009',
    name: 'AutoEssentials Pro',
    description: '4K dual dashcams, ceramic coating detailing kits, heavy-duty jump starters, and tire inflators.',
    logo: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=200&auto=format&fit=crop&q=80',
    email: 'service@autoessentials.com',
    phone: '+1 (800) 555-0109',
    address: '77 Motor Park Ave, Detroit, MI 48201',
    profit_margin: 29.00,
    status: 'ACTIVE',
  },
  {
    key: 'DAILYNEEDS',
    id: 'b0000000-0000-4000-8000-000000000010',
    name: 'DailyNeeds Superstore',
    description: 'Eco-friendly cleaning concentrates, ergonomic desk organizers, stainless steel tumblers, and storage.',
    logo: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&auto=format&fit=crop&q=80',
    email: 'help@dailyneeds.store',
    phone: '+1 (800) 555-0110',
    address: '1200 Commerce Way, Atlanta, GA 30301',
    profit_margin: 25.00,
    status: 'ACTIVE',
  }
];

// Seed Category Names per Business Index
export const BUSINESS_CATEGORIES = [
  ['Pro Audio', 'Ergonomics', 'Keyboards & Mice', 'Creator Studio', 'Display & Mounts'],
  ['Modern Furniture', 'Ambient Lighting', 'Kitchenware', 'Home Decor', 'Organization'],
  ['Pet Food & Treats', 'Interactive Toys', 'Smart Feeders', 'Grooming & Care', 'Beds & Furniture'],
  ['Urban Activewear', 'Outerwear', 'Leather Goods', 'Footwear', 'Bags & Packs'],
  ['Chef Cookware', 'Small Appliances', 'Coffee & Espresso', 'Bakeware Pro', 'Kitchen Gadgets'],
  ['Weights & Dumbbells', 'Cardio Equipment', 'Recovery & Massage', 'Fitness Wearables', 'Yoga & Mobility'],
  ['Smart Home IoT', 'Drones & Action Cams', 'Wireless Chargers', 'Portable Power', 'AR/VR Accessories'],
  ['Organic Skincare', 'Hair Elixirs', 'Botanical Serums', 'Wellness & Spa', 'Cosmetics'],
  ['Dash Cams', 'Car Detailing', 'Jump Starters', 'Interior Ergonomics', 'Tire & Maintenance'],
  ['Eco Cleaning', 'Desk Storage', 'Containers & Jars', 'Stationery & Paper', 'Drinkware & Flasks']
];

// Product Name Templates per Category
export const PRODUCT_CATALOG_TEMPLATES = {
  'Pro Audio': ['Studio Monitor Speaker 8"', 'Condenser Podcast Microphone', 'USB-C Audio Interface 4-Channel', 'Acoustic Foam Sound Panels 12-Pack', 'Studio Monitoring Headphones'],
  'Ergonomics': ['Electric Dual-Motor Standing Desk', 'Ergonomic Mesh Task Chair', 'Adjustable Aluminum Monitor Arm', 'Under-Desk Footrest Ottoman', 'Memory Foam Wrist Rest'],
  'Keyboards & Mice': ['Custom Gasket Mechanical Keyboard', 'Ultra-Light Precision Wireless Mouse', 'Hot-Swappable Tactile Switches (90x)', 'Custom Coiled Aviator USB Cable', 'PBT Dye-Sub Custom Keycaps'],
  'Creator Studio': ['4K Ultra-HD Camcorder Webcam', 'Bi-Color Ring Light with Tripod', 'Teleprompter for iPad/Smartphone', 'Green Screen Collapsible Backdrop', 'Wireless Lapel Mic System'],
  'Display & Mounts': ['34" Ultrawide Curved Monitor', 'Dual Stacking Monitor Stand', 'Desk Clamp Cable Management Tray', 'VESA Mount Laptop Holder', 'Lightbar Desk Lamp'],

  'Modern Furniture': ['Mid-Century Velvet Lounge Chair', 'Solid Oak Minimalist Coffee Table', 'Floating Modular Bookshelf', 'Fabric Accent Sofa 3-Seater', 'Minimalist Nightstand with Drawer'],
  'Ambient Lighting': ['Smart RGB LED Corner Floor Lamp', 'Handblown Glass Pendant Light', 'Rechargeable Wireless Table Lamp', 'Dimmable Architectural Desk Lamp', 'Under-Cabinet Motion Strip Light'],
  'Kitchenware': ['Cast Iron Enamel Dutch Oven 5.5Qt', 'Japanese Damascene Chef Knife 8"', 'Ceramic Non-Stick Frying Pan Set', 'Acacia Wood Cutting Board', 'Stainless Steel Measuring Spoons'],
  'Home Decor': ['Abstract Ceramic Flower Vase', 'Large Textured Linen Wall Art', 'Brass Geometric Wall Clock', 'Handwoven Macrame Wall Hanging', 'Scented Soy Candle Gift Set'],
  'Organization': ['Bamboo Drawer Organizer Trays', 'Stackable Clear Shoe Storage Boxes', 'Heavy-Duty Garment Rack', 'Under-Sink Sliding Drawer Rack', 'Woven Cotton Storage Basket'],

  'Pet Food & Treats': ['Freeze-Dried Raw Beef Dog Treats', 'Organic Grain-Free Salmon Cat Kibble', 'Dental Chews for Medium Dogs', 'Calming Hemp Soft Chews for Cats', 'Probiotic Dog Supplement Powder'],
  'Interactive Toys': ['Automatic Rolling Smart Ball Toy', 'Feather Wand Cat Exerciser', 'Tough Rubber Treat Puzzle Toy', 'Catnip Tunnel Play Mat', 'Agility Training Obstacle Kit'],
  'Smart Feeders': ['WiFi Automatic Pet Feeder 4L', 'Ultra-Quiet Stainless Water Fountain', 'Microchip Automatic Pet Bowl', 'Smart HD Camera Pet Dispenser', 'Slow Feeder Lick Mat Pair'],
  'Grooming & Care': ['Professional Pet Deshedding Brush', 'Quiet Electric Nail Grinder', 'Hypoallergenic Puppy Shampoo 32oz', 'Ear Cleaning Wipes 100-Ct', 'Self-Cleaning Slicker Brush'],
  'Beds & Furniture': ['Orthopedic Memory Foam Dog Bed', 'Multi-Level Wooden Cat Tree Tower', 'Waterproof Car Seat Pet Cover', 'Window Perch Hammock for Cats', 'Calming Donut Cuddler Bed'],

  'Urban Activewear': ['Seamless High-Waist Gym Leggings', 'Thermal Breathable Running Jacket', 'Moisture-Wicking Athletic Tee', 'Compression Training Shorts', 'Fleece Oversized Hoodie'],
  'Outerwear': ['Waterproof Insulated Parka', 'Windproof Lightweight Windbreaker', 'Fleece-Lined Softshell Vest', 'Packable Down Puffer Jacket', 'Classic Trench Coat'],
  'Leather Goods': ['Handcrafted Full-Grain Leather Wallet', 'Slim Minimalist Cardholder', 'Leather Laptop Sleeve 15"', 'Adjustable Leather Dress Belt', 'Key Organizer Leather Pouch'],
  'Footwear': ['Lightweight Trail Running Shoes', 'Urban Minimalist Sneakers', 'Waterproof Hiking Boots', 'Cushioned Slip-On Walking Shoes', 'Breathable Gym Cross-Trainers'],
  'Bags & Packs': ['Water-Resistant Commuter Backpack', 'Canvas Overnight Duffle Bag', 'Anti-Theft Travel Sling Bag', 'Tactical MOLLE EDC Backpack', 'Modular Camera Insert Bag'],

  'Chef Cookware': ['Tri-Ply Stainless Steel Cookware 10-Pc', 'Non-Stick Anodized Saucepan 3Qt', 'Carbon Steel Wok 12" Flat Bottom', 'Granite Stone Round Griddle', 'Copper Core Saute Pan 4Qt'],
  'Small Appliances': ['Countertop Air Fryer Toaster Oven', 'High-Speed Smoothie Blender 1400W', 'Digital Programmable Pressure Cooker', 'Precision Immersion Sous Vide', 'Compact Touchscreen Food Processor'],
  'Coffee & Espresso': ['15-Bar Semi-Automatic Espresso Machine', 'Conical Burr Coffee Grinder', 'Stainless Steel Pour-Over Kettle', 'French Press Coffee Maker 34oz', 'Milk Frother Handheld Steamer'],
  'Bakeware Pro': ['Aluminized Steel Muffin Pan 12-Cup', 'Silicone Non-Stick Baking Mats 2-Pk', 'Adjustable Rolling Pin with Rings', 'Springform Cake Pan Set 3-Pc', 'Stainless Steel Mixing Bowls 5-Pc'],
  'Kitchen Gadgets': ['Electric Gravity Pepper Grinder', 'Digital Instant-Read Meat Thermometer', 'Avocado Slicer & Saver Tool', 'Stainless Steel Garlic Press', 'Silicone Heat-Resistant Spatula Set'],

  'Weights & Dumbbells': ['Adjustable Dumbbell Set 5-52.5 lbs', 'Hex Rubber Dumbbells 25lb Pair', 'Cast Iron Kettlebell 35lb', 'Olympic Barbell 7ft 45lb', 'Bumper Weight Plates 160lb Set'],
  'Cardio Equipment': ['Foldable Magnetic Exercise Bike', 'Under-Desk Treadmill Walking Pad', 'Rowing Machine with Water Resistance', 'Speed Jump Rope with Ball Bearings', 'Mini Fitness Trampoline Rebounder'],
  'Recovery & Massage': ['Deep Tissue Percussion Massage Gun', 'Vibrating Foam Roller 4-Speed', 'Ice Compression Knee Wrap', 'Acupressure Mat and Pillow Set', 'Electric Foot Massager with Heat'],
  'Fitness Wearables': ['Smart Fitness Tracker HR & SpO2', 'Chest Strap Heart Rate Monitor', 'Smart Scale Body Fat Analyzer', 'GPS Running Watch with Music', 'Wireless Sport Earbuds Earhook'],
  'Yoga & Mobility': ['Non-Slip Eco TPE Yoga Mat 6mm', 'High-Density Yoga Foam Blocks 2-Pk', 'Stretching Resistance Band Set', 'Pilates Reformer Ring Kit', 'Cork Balance Board Trainer'],

  'Smart Home IoT': ['Smart WiFi Doorbell Camera 2K', 'Zigbee Smart Home Gateway Hub', 'Outdoor Solar Security Camera', 'Smart Motorized Blind Opener', 'RGB Spectrum Smart Light Bulbs 4-Pk'],
  'Drones & Action Cams': ['4K GPS Folding Drone with 3-Axis Gimbal', 'Waterproof 4K Action Camera 60fps', 'Mini Drone for Beginners with HD Cam', 'Handheld 3-Axis Gimbal Stabilizer', 'FPV Racing Goggles HD Receiver'],
  'Wireless Chargers': ['3-in-1 Foldable MagSafe Station', '15W Fast Wireless Charging Pad', 'Magnetic Power Bank 10000mAh', 'Car Mount Wireless Charger Holder', 'Dual Charging Dock for Controllers'],
  'Portable Power': ['600W Portable Power Station 512Wh', '100W Foldable Solar Panel Charger', '20000mAh Laptop Power Bank 65W', 'Heavy-Duty Extension Power Strip', 'Pure Sine Wave Inverter 1000W'],
  'AR/VR Accessories': ['VR Headset Adjustable Comfort Strap', 'Prescription Lens Inserts for VR', 'VR Controller Grip Covers Pair', 'VR Cable Management Ceiling Pulley', 'Haptic Feedback Gaming Vest'],

  'Organic Skincare': ['Hyaluronic Acid Hydrating Serum', 'Vitamin C Brightening Facial Cleanser', 'Retinol Night Repair Cream', 'Niacinamide Pore Refining Serum', 'Gentle Exfoliating AHA/BHA Toner'],
  'Hair Elixirs': ['Argan & Keratin Hair Treatment Oil', 'Biotin Hair Growth Thickening Serum', 'Deep Conditioning Scalp Mask', 'Heat Protectant Spray 8oz', 'Sulfate-Free Organic Shampoo'],
  'Botanical Serums': ['Rosehip Seed Regenerative Oil', 'Jojoba Balancing Facial Elixir', 'Tea Tree Clarifying Spot Treatment', 'Bakuchiol Natural Retinol Serum', 'Squalane Moisture Lock Drops'],
  'Wellness & Spa': ['Ultrasonic Essential Oil Diffuser', 'Aromatherapy Essential Oil 6-Set', 'Natural Jade Facial Gua Sha Stone', 'Epsom Salt Lavender Bath Soaks', 'Silk Sleep Mask & Pillowcase Set'],
  'Cosmetics': ['Mineral Loose Powder Foundation', 'Organic Tinted Lip & Cheek Balm', 'Waterproof Vegan Liquid Eyeliner', 'Bamboo Makeup Brush Set 12-Pc', 'Hydrating Setting Spray Rosewater'],

  'Dash Cams': ['Dual 4K Front & 1080P Rear Dash Cam', '3-Channel Taxi Dash Cam Infrared', 'Wireless Backup Camera with 7" Monitor', 'Smart Mirror Dash Cam 12" Touch', 'Hardwire Cable Kit for Parking Monitor'],
  'Car Detailing': ['Ceramic Coating Spray Paint Sealant', 'Foam Cannon Pressure Washer Gun', 'Microfiber Car Cleaning Towels 12-Pk', 'Car Interior Cleaner & Protectant', 'Leather Conditioner & Cleaner Kit'],
  'Jump Starters': ['2000A Peak Car Jump Starter 12V', 'Heavy-Duty Jumper Cables 20ft 2GA', 'Smart Tire Inflator Cordless Pump', 'Battery Charger Maintainer 4A', 'Car Battery Load Tester Digital'],
  'Interior Ergonomics': ['Memory Foam Car Seat Cushion', 'Lumbar Support Back Pillow for Driving', 'Car Organizer Between Seats Tray', 'Magnetic Universal Phone Mount', 'Custom Fit All-Weather Floor Mats'],
  'Tire & Maintenance': ['Digital Tire Pressure Gauge 150 PSI', 'Tire Repair Plug Kit Heavy Duty', 'OBD2 Scanner Diagnostic Tool Code Reader', 'Telescopic Lug Wrench Set', 'Oil Filter Wrench Cap Tool Set'],

  'Eco Cleaning': ['Plant-Based All-Purpose Cleaner Concentrates', 'Biodegradable Sponge Scrubber 6-Pk', 'Wool Dryer Balls Organic 6-Pack', 'Glass Spray Bottles Refillable 2-Pk', 'Natural Bamboo Dish Scrub Brushes'],
  'Desk Storage': ['Mesh Steel Desktop Document Tray', 'Wooden Monitor Riser with Drawers', 'Pen & Pencil Holder Organizer', 'Under-Desk Cable Tray Basket', 'Leatherette Desk Pad Blotter 36x20'],
  'Containers & Jars': ['Glass Food Prep Containers 10-Pc', 'Airtight Cereal Storage Containers 4-Pk', 'Stainless Steel Bento Lunch Box', 'Vacuum Sealer Bags Rolls 3-Pk', 'Spice Jars Glass with Labels 24-Pk'],
  'Stationery & Paper': ['Hardcover Dotted Grid Journal A5', 'Smooth Gel Pens Fine Point 0.5mm 12-Pk', 'Pastel Aesthetic Highlighters 6-Pk', 'Sticky Notes Pastel Pad Bundle', 'Refillable Fountain Pen Fine Nib'],
  'Drinkware & Flasks': ['Insulated Stainless Tumbler 40oz with Straw', 'Vacuum Insulated Water Bottle 32oz', 'Glass Water Bottle with Silicone Sleeve', 'Travel Coffee Mug Leakproof 16oz', 'Fruit Infuser Water Pitcher 2L']
};

// Generic First & Last Names for realistic synthesis
export const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Timothy', 'Deborah',
  'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia',
  'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen',
  'Stephen', 'Anna', 'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Gregory', 'Christine', 'Alexander', 'Debra', 'Frank', 'Rachel',
  'Patrick', 'Catherine', 'Raymond', 'Carolyn', 'Jack', 'Janet', 'Dennis', 'Ruth', 'Jerry', 'Maria'
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes'
];

export const CITIES_STATES = [
  { city: 'San Jose', state: 'CA', pincode: '95110' },
  { city: 'Seattle', state: 'WA', pincode: '98101' },
  { city: 'Austin', state: 'TX', pincode: '78701' },
  { city: 'New York', state: 'NY', pincode: '10018' },
  { city: 'Chicago', state: 'IL', pincode: '60611' },
  { city: 'Los Angeles', state: 'CA', pincode: '90012' },
  { city: 'Miami', state: 'FL', pincode: '33139' },
  { city: 'Denver', state: 'CO', pincode: '80202' },
  { city: 'Boston', state: 'MA', pincode: '02110' },
  { city: 'Atlanta', state: 'GA', pincode: '30301' },
  { city: 'Portland', state: 'OR', pincode: '97209' },
  { city: 'Salt Lake City', state: 'UT', pincode: '84101' },
  { city: 'San Francisco', state: 'CA', pincode: '94104' },
  { city: 'Dallas', state: 'TX', pincode: '75201' },
  { city: 'Phoenix', state: 'AZ', pincode: '85001' }
];

export const CHAT_TEMPLATES = {
  ADMIN_DEALER: [
    "Hi there, could you confirm the estimated dispatch SLA for order {order_num}?",
    "We have updated our stock forecast for next month. Please check the new reorder targets.",
    "Order {order_num} has been accepted. We will dispatch within 24 hours.",
    "Please send over the updated wholesale rate card for the new Q3 product line.",
    "Invoice for batch PO-{po_num} has been cleared and marked as paid.",
    "Customer requested expedited delivery for order {order_num}. Can we upgrade carrier?",
    "Tracking details updated for order {order_num}. Item is in transit."
  ],
  ADMIN_MARKETING: [
    "How is the ROI performing on the new {campaign_name} ad campaign?",
    "The campaign conversion rate is up by 18% this week following the video ad refresh.",
    "Please prepare the creative assets for the upcoming Holiday Sale promotion.",
    "The budget for campaign {campaign_name} has been approved and increased.",
    "Social posts for Instagram and TikTok have been scheduled for tomorrow morning.",
    "Let's review the engagement metrics from yesterday's promotional blast."
  ],
  ADMIN_SALES: [
    "Dealer inbound inquiry came in from {company_name}. Can you follow up today?",
    "I've sent the B2B partnership proposal to the new lead. Awaiting contract sign-off.",
    "Quarterly sales targets have been hit! Great work team.",
    "Can you schedule a demo session for the new product catalog with prospect partners?",
    "Lead status updated to Qualified in the sales pipeline."
  ]
};
