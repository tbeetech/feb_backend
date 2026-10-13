const CATEGORIES = {
    FASHION: {
        name: 'fashion',
        subcategories: [
            'dresses',
            'tops',
            'cardigans',
            'beachwear',
            'sets'
        ]
    },
    ACCESSORIES: {
        name: 'accessories',
        subcategories: [
            'bags',
            'hats',
            'scarves',
            'hair-accessories',
            'jewelry'
        ]
    },
    CUSTOM: {
        name: 'custom',
        subcategories: [
            'bespoke-wear',
            'amigurumi',
            'home-decor',
            'bridal'
        ]
    },
    CLASSES: {
        name: 'classes',
        subcategories: [
            'beginner-basics',
            'wearables-workshop',
            'amigurumi-masterclass',
            'diy-kits'
        ]
    },
    NEW: {
        name: 'new',
        subcategories: [
            'this-week',
            'this-month'
        ]
    }
};

module.exports = {
    CATEGORIES,
    CATEGORY_NAMES: Object.values(CATEGORIES).map(cat => cat.name),
    SUBCATEGORIES: Object.values(CATEGORIES).reduce((acc, cat) => ({
        ...acc,
        [cat.name]: cat.subcategories
    }), {})
};
