const CATEGORIES = {
    ACCESSORIES: {
        name: 'accessories',
        subcategories: [
            'sunglasses',
            'wrist-watches',
            'belts',
            'bangles-bracelet',
            'earrings',
            'necklace',
            'pearls'
        ]
    },
    FRAGRANCE: {
        name: 'fragrance',
        subcategories: [
            'designer-niche',
            'unboxed',
            'testers',
            'arabian',
            'diffuser',
            'mist'
        ]
    },
    BAGS: {
        name: 'bags',
        subcategories: []
    },
    CLOTHES: {
        name: 'clothes',
        subcategories: []
    },
    JEWERLY: {
        name: 'jewerly',
        subcategories: []
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
