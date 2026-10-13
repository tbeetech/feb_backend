// seed_knitbi.js
// Seeds the Knitbi MongoDB database with authentic handmade crochet products,
// categories, sample reviews, and admin account.

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const DB_URL = process.env.DB_URL;
console.log('Connecting to:', DB_URL.replace(/:([^:@]+)@/, ':****@'));

const Products = require('./src/products/products.model');
const User = require('./src/users/user.model');
const Reviews = require('./src/reviews/reviews.model');

const productsData = [
  // ==========================================
  // CROCHET FASHION
  // ==========================================
  {
    name: 'Sakura Blossom Open-Back Crochet Maxi Dress',
    category: 'fashion',
    subcategory: 'dresses',
    price: 85000,
    oldPrice: 105000,
    rating: 5.0,
    orderType: 'regular',
    sizeType: 'roman',
    sizes: ['S', 'M', 'L'],
    stockStatus: 'In Stock',
    stockQuantity: 8,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/1970_crocheted_wedding_dress.jpg/960px-1970_crocheted_wedding_dress.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/White_Crochet_dress_designed_by_Sybil_Connolly_-_Full_Length_Back.jpg/960px-White_Crochet_dress_designed_by_Sybil_Connolly_-_Full_Length_Back.jpg'
    ],
    colors: [
      { name: 'Ivory Cream', hexCode: '#F7F5F0' },
      { name: 'Dusty Peach', hexCode: '#E8C5A5' }
    ],
    description: 'An ethereal floor-length artisanal crochet maxi dress inspired by oriental cherry blossoms. Handcrafted using premium combed Egyptian cotton yarn with an open lattice back, scallop hemline, and breathable tailored drape. Ideal for destination weddings, sunset soirees, and high-fashion resort wear.'
  },
  {
    name: 'Kyoto Braid Cropped Halter Top',
    category: 'fashion',
    subcategory: 'tops',
    price: 32000,
    oldPrice: 40000,
    rating: 4.9,
    orderType: 'regular',
    sizeType: 'roman',
    sizes: ['XS', 'S', 'M', 'L'],
    stockStatus: 'In Stock',
    stockQuantity: 15,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/e/e7/Crop_top_de_cuero_relieve_y_crochet..jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Frente_top_tejido_a_crochet.jpg/960px-Frente_top_tejido_a_crochet.jpg'
    ],
    colors: [
      { name: 'Indigo Navy', hexCode: '#0F223D' },
      { name: 'Warm Cream', hexCode: '#FAF8F5' },
      { name: 'Terracotta', hexCode: '#C87D55' }
    ],
    description: 'Handmade halter top featuring oriental braid ties, adjustable corset back, and intricate geometric lace-work. Breathable natural cotton keeps you cool under the sun. Pairs seamlessly with tailored linen trousers or flowy maxi skirts.'
  },
  {
    name: 'Monsoon Hand-Knitted Chunky Cardigan',
    category: 'fashion',
    subcategory: 'cardigans',
    price: 68000,
    oldPrice: 82000,
    rating: 4.8,
    orderType: 'regular',
    sizeType: 'roman',
    sizes: ['S', 'M', 'L', 'XL'],
    stockStatus: 'In Stock',
    stockQuantity: 6,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Simple_sweater_dress_with_with_turtleneck_-_pose_1.jpg/960px-Simple_sweater_dress_with_with_turtleneck_-_pose_1.jpg'
    ],
    colors: [
      { name: 'Natural Oat', hexCode: '#DFC2A8' },
      { name: 'Forest Sage', hexCode: '#8A9A86' }
    ],
    description: 'Oversized cozy crochet cardigan with balloon sleeves, rib-knit cuffs, and bamboo toggle buttons. Crafted from ultra-soft baby alpaca-cotton blend yarn for luxurious featherlight warmth without bulk.'
  },
  {
    name: 'Bali Sunset Triangle Crochet Bikini & Sarong Set',
    category: 'fashion',
    subcategory: 'beachwear',
    price: 42000,
    oldPrice: 55000,
    rating: 5.0,
    orderType: 'regular',
    sizeType: 'roman',
    sizes: ['S', 'M', 'L'],
    stockStatus: 'In Stock',
    stockQuantity: 12,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Crochet_bikini.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/1/12/Crochet_bikini.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Michele_Merkin_3.jpg/960px-Michele_Merkin_3.jpg'
    ],
    colors: [
      { name: 'Sunset Bronze', hexCode: '#C87D55' },
      { name: 'Midnight Navy', hexCode: '#0F223D' }
    ],
    description: '100% water-tolerant micro-crochet two-piece bikini set complete with a matching sheer hip-tie sarong. Meticulously lined with soft stretch mesh for secure, comfortable, and non-sheer beachwear elegance.'
  },
  {
    name: 'Lotus Granny-Square Two-Piece Skirt Set',
    category: 'fashion',
    subcategory: 'sets',
    price: 78000,
    oldPrice: 95000,
    rating: 4.9,
    orderType: 'regular',
    sizeType: 'roman',
    sizes: ['S', 'M', 'L'],
    stockStatus: 'Pre Order',
    stockQuantity: 5,
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Lady_wearing_a_white_hand_made_crochet_outfit.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/c/ce/Lady_wearing_a_white_hand_made_crochet_outfit.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Top_gehaakt_van_witte_kunstvezel_met_patronen_in_spectrumkleuren%2C_gehaakte_bandjes_aan_de_zijkanten_en_op_de_schouders_om_vast_te_knopen%2C_objectnr_80869%281%29.JPG/960px-Top_gehaakt_van_witte_kunstvezel_met_patronen_in_spectrumkleuren%2C_gehaakte_bandjes_aan_de_zijkanten_en_op_de_schouders_om_vast_te_knopen%2C_objectnr_80869%281%29.JPG'
    ],
    colors: [
      { name: 'Natural Multitone', hexCode: '#D9C3AD' },
      { name: 'Monochrome Midnight', hexCode: '#1A293E' }
    ],
    description: 'Statement coordinating set comprising a square-neck crop cami and matching pencil-midi skirt. Handcrafted with traditional concentric lotus granny square motifs in harmonious oriental earth tones.'
  },

  // ==========================================
  // CROCHET ACCESSORIES
  // ==========================================
  {
    name: 'Zen Garden Granny Square Tote Bag',
    category: 'accessories',
    subcategory: 'bags',
    price: 38000,
    oldPrice: 48000,
    rating: 5.0,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['One Size'],
    stockStatus: 'In Stock',
    stockQuantity: 20,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Crochet_bag.jpg/960px-Crochet_bag.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Crochet_bag.jpg/960px-Crochet_bag.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Silling_bag.jpg/960px-Silling_bag.jpg'
    ],
    colors: [
      { name: 'Sage & Cream', hexCode: '#96A794' },
      { name: 'Ochre Earth', hexCode: '#C59B6A' }
    ],
    description: 'Sturdy yet supple handmade crochet tote bag lined with raw cotton canvas and reinforced inner pocket. Spacious enough for your daily essentials, laptop, or weekend artisan market finds.'
  },
  {
    name: 'Artisan Raffia & Cotton Wide-Brim Sun Hat',
    category: 'accessories',
    subcategory: 'hats',
    price: 29000,
    oldPrice: 36000,
    rating: 4.9,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['One Size'],
    stockStatus: 'In Stock',
    stockQuantity: 14,
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Crochet_hat.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/Crochet_hat.jpg'
    ],
    colors: [
      { name: 'Golden Straw', hexCode: '#E2C48E' },
      { name: 'Black Noir', hexCode: '#222222' }
    ],
    description: 'Sculptural floppy sun hat hand-crocheted from organic raffia and soft cotton thread. Crushable and packable for effortless resort and weekend travel with high UV shade protection.'
  },
  {
    name: 'Silk-Blend Wave Lace Infinity Scarf',
    category: 'accessories',
    subcategory: 'scarves',
    price: 26000,
    oldPrice: 32000,
    rating: 4.8,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['One Size'],
    stockStatus: 'In Stock',
    stockQuantity: 18,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Crochet_Chains_Infinity_Scarf.jpg/960px-Crochet_Chains_Infinity_Scarf.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Crochet_Chains_Infinity_Scarf.jpg/960px-Crochet_Chains_Infinity_Scarf.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Crochet_scarf_in_two_shades_of_blue.jpg/960px-Crochet_scarf_in_two_shades_of_blue.jpg'
    ],
    colors: [
      { name: 'Blush Peony', hexCode: '#E5B9B0' },
      { name: 'Sky Mist', hexCode: '#9DB3C8' }
    ],
    description: 'Featherlight loop scarf featuring an intricate oriental rippling wave crochet pattern. Woven from silk and merino wool for a delicate, drape-friendly sheen and ultra-soft touch.'
  },
  {
    name: 'Peony Blossom Micro-Crochet Drop Earrings',
    category: 'accessories',
    subcategory: 'jewelry',
    price: 15000,
    oldPrice: 19500,
    rating: 5.0,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['One Size'],
    stockStatus: 'In Stock',
    stockQuantity: 25,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Crochet_d%27oreille_disque.JPG/960px-Crochet_d%27oreille_disque.JPG',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Crochet_d%27oreille_disque.JPG/960px-Crochet_d%27oreille_disque.JPG',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Crochet_oreille.JPG/960px-Crochet_oreille.JPG'
    ],
    colors: [
      { name: 'Pale Pearl', hexCode: '#F5F3EF' },
      { name: 'Golden Ochre', hexCode: '#D4AF37' }
    ],
    description: 'Delicate micro-crochet floral earrings mounted on 14k gold-filled hypoallergenic hooks. Weightless on the ears with handcrafted individual petal detail that sways gracefully.'
  },
  {
    name: 'Twisted Rib Crochet Headband & Scrunchie Duo',
    category: 'accessories',
    subcategory: 'hair-accessories',
    price: 12500,
    oldPrice: 16000,
    rating: 4.7,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['One Size'],
    stockStatus: 'In Stock',
    stockQuantity: 30,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Crochet_hairpins_for_my_first_bazaar.jpg/960px-Crochet_hairpins_for_my_first_bazaar.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Crochet_hairpins_for_my_first_bazaar.jpg/960px-Crochet_hairpins_for_my_first_bazaar.jpg'
    ],
    colors: [
      { name: 'Latte Cream', hexCode: '#D2BBA0' },
      { name: 'Warm Terracotta', hexCode: '#C87D55' }
    ],
    description: 'Comfortable non-slip wide crochet hair wrap paired with a voluminous matching hair scrunchie. Keeps hair elegantly styled while preventing breakage and frizz.'
  },

  // ==========================================
  // CUSTOM PIECES
  // ==========================================
  {
    name: 'Bespoke Bridal Crochet Gown & Veil Consultation',
    category: 'custom',
    subcategory: 'bridal',
    price: 220000,
    oldPrice: 280000,
    rating: 5.0,
    orderType: 'contact-to-order',
    sizeType: 'none',
    sizes: ['Custom Made-to-Measure'],
    stockStatus: 'Pre Order',
    stockQuantity: 3,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/White_Crochet_dress_designed_by_Sybil_Connolly_-_Full_Length_Back.jpg/960px-White_Crochet_dress_designed_by_Sybil_Connolly_-_Full_Length_Back.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/White_Crochet_dress_designed_by_Sybil_Connolly_-_Full_Length_Back.jpg/960px-White_Crochet_dress_designed_by_Sybil_Connolly_-_Full_Length_Back.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/White_Crochet_dress_designed_by_Sybil_Connolly_-_Full_Length_Front.jpg/960px-White_Crochet_dress_designed_by_Sybil_Connolly_-_Full_Length_Front.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/1970_crocheted_wedding_dress.jpg/960px-1970_crocheted_wedding_dress.jpg'
    ],
    colors: [
      { name: 'Ivory Silk', hexCode: '#FAF9F6' },
      { name: 'Champagne Shimmer', hexCode: '#F4E8D1' }
    ],
    description: 'Our flagship custom couture commission. Made-to-measure bridal crochet gown crafted over 6 to 8 weeks with personalized silhouette, lace pattern, and fitting milestones with our lead artisan.'
  },
  {
    name: 'Handmade Amigurumi Forest Animal Keepsake',
    category: 'custom',
    subcategory: 'amigurumi',
    price: 24000,
    oldPrice: 30000,
    rating: 4.9,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['Height: 25cm'],
    stockStatus: 'In Stock',
    stockQuantity: 10,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Crochet_Baby_Globe_with_purple_hat_at_PSL.jpg/960px-Crochet_Baby_Globe_with_purple_hat_at_PSL.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Crochet_Baby_Globe_with_purple_hat_at_PSL.jpg/960px-Crochet_Baby_Globe_with_purple_hat_at_PSL.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Yarn_ball_craft.jpg/960px-Yarn_ball_craft.jpg'
    ],
    colors: [
      { name: 'Vintage Fawn', hexCode: '#BC9B7A' }
    ],
    description: 'Charming, heirloom-quality amigurumi stuffed character hand-crocheted using 100% hypoallergenic organic cotton yarn and safety-locked features. Ideal newborn or collector keepsake.'
  },
  {
    name: 'Hand-Knotted Oriental Heritage Throw Blanket',
    category: 'custom',
    subcategory: 'home-decor',
    price: 95000,
    oldPrice: 120000,
    rating: 5.0,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['150cm x 180cm'],
    stockStatus: 'Pre Order',
    stockQuantity: 4,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Blanket_of_natural_dyed_yarn.jpg/960px-Blanket_of_natural_dyed_yarn.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Blanket_of_natural_dyed_yarn.jpg/960px-Blanket_of_natural_dyed_yarn.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Baby_blanket_from_flower_loom_motifs_complete_view.jpg/960px-Baby_blanket_from_flower_loom_motifs_complete_view.jpg'
    ],
    colors: [
      { name: 'Botanical Earth', hexCode: '#887058' },
      { name: 'Indigo Terracotta', hexCode: '#1A293E' }
    ],
    description: 'Heirloom-weight crochet throw blanket featuring geometric tessellations and fringed edging. Dyed with plant-based botanical extracts for timeless interior warmth and artisanal ambiance.'
  },

  // ==========================================
  // CROCHET CLASSES
  // ==========================================
  {
    name: 'Beginner Basics: The First Stitch Masterclass (4 Weeks)',
    category: 'classes',
    subcategory: 'beginner-basics',
    price: 45000,
    oldPrice: 60000,
    rating: 5.0,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['Online Live Cohort', 'Lagos Studio Hands-on'],
    stockStatus: 'In Stock',
    stockQuantity: 20,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Lady_crocheting_traditional_xhosa_beanie.jpg/960px-Lady_crocheting_traditional_xhosa_beanie.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Lady_crocheting_traditional_xhosa_beanie.jpg/960px-Lady_crocheting_traditional_xhosa_beanie.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/08/M.-Zsolnay_Crocheting_Woman_1913.jpg'
    ],
    colors: [
      { name: 'Includes Starter Yarn Kit', hexCode: '#E8C5A5' }
    ],
    description: 'Zero-experience friendly class! Learn hook holding, foundation chains, single/double/treble crochet, reading stitch diagrams, and complete your first wearable project with live 1-on-1 mentoring.'
  },
  {
    name: 'Wearables & Garment Construction Workshop',
    category: 'classes',
    subcategory: 'wearables-workshop',
    price: 55000,
    oldPrice: 70000,
    rating: 4.9,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['Weekend Intensive'],
    stockStatus: 'In Stock',
    stockQuantity: 15,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Irit_Suki_second.jpg/960px-Irit_Suki_second.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Irit_Suki_second.jpg/960px-Irit_Suki_second.jpg'
    ],
    colors: [
      { name: 'Standard Admission', hexCode: '#0F223D' }
    ],
    description: 'Level up your craft! Learn how to accurately measure body dimensions, calculate gauge, shape armholes, construct neckline borders, and seamlessly assemble your own crochet cardigans and dresses.'
  },
  {
    name: 'Artisan Amigurumi & 3D Crochet Masterclass',
    category: 'classes',
    subcategory: 'amigurumi-masterclass',
    price: 38000,
    oldPrice: 50000,
    rating: 5.0,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['2-Session Masterclass'],
    stockStatus: 'In Stock',
    stockQuantity: 15,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Yarn_ball_craft.jpg/960px-Yarn_ball_craft.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Yarn_ball_craft.jpg/960px-Yarn_ball_craft.jpg'
    ],
    colors: [
      { name: 'Includes Materials Box', hexCode: '#D9A05B' }
    ],
    description: 'Master continuous spiral crocheting, invisible decreases, seamless limb attachments, and facial embroidery techniques for adorable plush creations and collector toys.'
  },
  {
    name: 'Knitbi Complete DIY Beginner Crochet Kit & Guide',
    category: 'classes',
    subcategory: 'diy-kits',
    price: 28000,
    oldPrice: 35000,
    rating: 4.9,
    orderType: 'regular',
    sizeType: 'none',
    sizes: ['Complete Kit Box'],
    stockStatus: 'In Stock',
    stockQuantity: 50,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Hooks%2C_crochet_%28AM_1965.78.619-4%29.jpg/960px-Hooks%2C_crochet_%28AM_1965.78.619-4%29.jpg',
    gallery: [
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Hooks%2C_crochet_%28AM_1965.78.619-4%29.jpg/960px-Hooks%2C_crochet_%28AM_1965.78.619-4%29.jpg',
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Hooks%2C_crochet_%28AM_1965.78.619-1%29.jpg/960px-Hooks%2C_crochet_%28AM_1965.78.619-1%29.jpg'
    ],
    colors: [
      { name: 'Oriental Pastel Palette', hexCode: '#F0E4D7' }
    ],
    description: 'Everything you need in a single gift box: 5 ergonomic bamboo crochet hooks (3.0mm - 6.0mm), 4 skeins of premium organic combed cotton yarn, stitch markers, tapestry needle, and our step-by-step Knitbi illustrated manual.'
  }
];

async function seed() {
  try {
    await mongoose.connect(DB_URL);
    console.log('Successfully connected to MongoDB database:', mongoose.connection.name);

    // 1. Create or ensure admin user exists
    let admin = await User.findOne({ email: 'admin@knitbi.com' });
    if (!admin) {
      admin = new User({
        username: 'knitbi_admin',
        email: 'admin@knitbi.com',
        password: 'KnitbiAdmin2026!',
        role: 'admin',
        bio: 'Founder & Lead Artisan at Knitbi — 100% Handmade Crochet Wears'
      });
      await admin.save();
      console.log('Created admin user: admin@knitbi.com (Password: KnitbiAdmin2026!)');
    } else {
      console.log('Admin user already exists:', admin.email);
    }

    // 2. Clear existing products in knitbi database
    const deleteResult = await Products.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing products in ${mongoose.connection.name}.`);

    // 3. Insert new Knitbi products with author attached
    const productsToInsert = productsData.map(p => ({
      ...p,
      author: admin._id,
      deliveryTimeFrame: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }));

    const inserted = await Products.insertMany(productsToInsert);
    console.log(`Successfully seeded ${inserted.length} Knitbi products into MongoDB!`);

    // 4. Add a sample review for the first product
    await Reviews.deleteMany({});
    const sampleReview = new Reviews({
      comment: 'The craftsmanship on this crochet dress is magnificent! The drape is flattering and breathable, and the oriental lace pattern turned heads all evening.',
      rating: 5,
      productId: inserted[0]._id,
      userId: admin._id,
      status: 'active'
    });
    await sampleReview.save();
    console.log('Added initial verified customer review.');

    console.log('\n--- SEED COMPLETE ---');
    const count = await Products.countDocuments();
    console.log(`Total products in database: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
