const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already an absolute URL (starts with http:// or https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If it's a relative path, make it absolute
    return `/images/${imagePath}`;
};

const normalizeImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a relative path
    if (imageUrl.startsWith('/images/') || imageUrl.startsWith('/uploads/')) {
        return imageUrl;
    }
    
    // If it's an absolute URL from our domain
    if (imageUrl.includes('feb-backend.vercel.app')) {
        const urlParts = imageUrl.split('/');
        return `/${urlParts.slice(3).join('/')}`;
    }
    
    // For external URLs, keep them as is
    return imageUrl;
};

module.exports = {
    getImageUrl,
    normalizeImageUrl
}; 