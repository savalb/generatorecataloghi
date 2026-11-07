/**
 * Product Card Component
 * Reusable product card with layout-specific styling
 */

import React from 'react';
import { ShoppingBag, Tag, Scale } from 'lucide-react';

const ProductCard = ({ 
  product, 
  layoutType, 
  brandColors, 
  showQuantitySelector = false,
  quantity = 0,
  onQuantityChange,
  isWeightProduct = false
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Check if product is sold by weight based on category or description
  const checkIsWeightProduct = () => {
    const weightCategories = ['carne', 'pesce', 'ortofrutta', 'gastronomia', 'formaggi', 'affettati'];
    const weightKeywords = ['kg', 'etto', 'peso', 'al kg', 'al etto'];
    
    if (!product) return false;
    
    const categoryLower = (product.category || '').toLowerCase();
    const descLower = (product.description || '').toLowerCase();
    const nameLower = (product.name || '').toLowerCase();
    
    return weightCategories.some(cat => categoryLower.includes(cat)) ||
           weightKeywords.some(kw => descLower.includes(kw) || nameLower.includes(kw));
  };

  const productIsWeight = isWeightProduct !== undefined ? isWeightProduct : checkIsWeightProduct();

  // Render different card styles based on layout type
  const renderCardContent = () => {
    switch (layoutType) {
      case 'alimentari_prezzone_impatto':
        return (
          <div className="product-card prezzone-card">
            <div className="product-image-container">
              <img 
                src={product.image_url || '/placeholder-product.png'} 
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
              <span className="discount-badge" style={{ backgroundColor: brandColors?.primary || '#A62B2B' }}>
                OFFERTA
              </span>
            </div>
            <div className="product-info">
              <h4 className="product-name">{truncateText(product.name, 40)}</h4>
              <p className="product-description">{truncateText(product.description, 60)}</p>
              <div className="price-section">
                <span className="price-value" style={{ color: brandColors?.primary || '#A62B2B' }}>
                  {formatPrice(product.price)}
                </span>
                {productIsWeight && (
                  <span className="weight-indicator">
                    <Scale size={14} /> al kg
                  </span>
                )}
              </div>
            </div>
          </div>
        );

      case 'tech_grande_occasione':
        return (
          <div className="product-card tech-hero-card">
            <div className="tech-image-hero">
              <img 
                src={product.image_url || '/placeholder-product.png'} 
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
            </div>
            <div className="product-info">
              <h2 className="product-name hero-title">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <div className="tech-specs-circles">
                <div className="spec-circle">5G</div>
                <div className="spec-circle">12GB</div>
                <div className="spec-circle">OLED</div>
              </div>
              <div className="price-section">
                <span className="price-value">{formatPrice(product.price)}</span>
                <span className="finance-badge">Tasso Zero</span>
              </div>
            </div>
          </div>
        );

      case 'abbigliamento_lookbook_minimal':
        return (
          <div className="product-card lookbook-card">
            <div className="lookbook-image">
              <img 
                src={product.image_url || '/placeholder-product.png'} 
                alt={product.name}
                className="product-image full-height"
                loading="lazy"
              />
            </div>
            <div className="lookbook-info">
              <span className="collection-tag">Nuova Collezione</span>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <span className="price-value">{formatPrice(product.price)}</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="product-card standard-card">
            <div className="product-image-container">
              <img 
                src={product.image_url || '/placeholder-product.png'} 
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
            </div>
            <div className="product-info">
              <h4 className="product-name">{truncateText(product.name, 50)}</h4>
              {product.category && (
                <span className="category-badge">
                  <Tag size={12} /> {product.category}
                </span>
              )}
              <p className="product-description">{truncateText(product.description, 80)}</p>
              <div className="price-section">
                <span className="price-value">{formatPrice(product.price)}</span>
                {productIsWeight && (
                  <span className="weight-note">
                    <Scale size={12} /> prezzo al kg
                  </span>
                )}
              </div>
              {showQuantitySelector && (
                <div className="quantity-selector">
                  <button 
                    className="qty-btn"
                    onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => onQuantityChange(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`product-card-wrapper ${layoutType}`}>
      {renderCardContent()}
    </div>
  );
};

export default ProductCard;
