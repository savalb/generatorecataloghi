/**
 * WhatsApp Order Generator Component
 * Handles quantity selection, weight products calculation, and order message generation
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Minus, Scale, ShoppingBag, Send } from 'lucide-react';

const WhatsAppOrderGenerator = ({ 
  catalog, 
  items, 
  tenant, 
  onOrderComplete,
  onTrackEvent 
}) => {
  const [quantities, setQuantities] = useState({});
  const [weightNotes, setWeightNotes] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize quantities for all products
  useEffect(() => {
    if (items && items.length > 0) {
      const initialQuantities = {};
      const initialWeightNotes = {};
      
      items.forEach(item => {
        const productId = item.product_id;
        initialQuantities[productId] = 0;
        
        // Check if product is sold by weight
        const isWeightProduct = checkIsWeightProduct(item.products);
        if (isWeightProduct) {
          initialWeightNotes[productId] = '';
        }
      });
      
      setQuantities(initialQuantities);
      setWeightNotes(initialWeightNotes);
    }
  }, [items]);

  // Check if product is sold by weight
  const checkIsWeightProduct = (product) => {
    if (!product) return false;
    
    const weightCategories = ['carne', 'pesce', 'ortofrutta', 'gastronomia', 'formaggi', 'affettati'];
    const weightKeywords = ['kg', 'etto', 'peso', 'al kg', 'al etto'];
    
    const categoryLower = (product.category || '').toLowerCase();
    const descLower = (product.description || '').toLowerCase();
    const nameLower = (product.name || '').toLowerCase();
    
    return weightCategories.some(cat => categoryLower.includes(cat)) ||
           weightKeywords.some(kw => descLower.includes(kw) || nameLower.includes(kw));
  };

  const updateQuantity = (productId, delta) => {
    setQuantities(prev => {
      const newQty = Math.max(0, (prev[productId] || 0) + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const updateWeightNote = (productId, note) => {
    setWeightNotes(prev => ({ ...prev, [productId]: note }));
  };

  const getTotalOrderValue = () => {
    if (!items) return 0;
    
    return items.reduce((total, item) => {
      const qty = quantities[item.product_id] || 0;
      const price = parseFloat(item.products?.price) || 0;
      return total + (qty * price);
    }, 0);
  };

  const getTotalItems = () => {
    if (!items) return 0;
    
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const generateOrderMessage = () => {
    if (!items || !tenant) return '';
    
    const lines = [`Ciao! Vorrei ordinare dal volantino ${catalog?.name}:`];
    let hasOrder = false;
    
    items.forEach(item => {
      const qty = quantities[item.product_id] || 0;
      if (qty > 0) {
        hasOrder = true;
        const productName = item.products?.name || 'Prodotto';
        const price = parseFloat(item.products?.price) || 0;
        const total = qty * price;
        
        let line = `• ${qty}x ${productName}`;
        
        // Add weight note if applicable
        const isWeightProduct = checkIsWeightProduct(item.products);
        if (isWeightProduct && weightNotes[item.product_id]) {
          line += ` (${weightNotes[item.product_id]})`;
        }
        
        line += ` - €${total.toFixed(2)}`;
        lines.push(line);
      }
    });
    
    if (!hasOrder) {
      return '';
    }
    
    const totalValue = getTotalOrderValue();
    lines.push('');
    lines.push(`*Totale ordine: €${totalValue.toFixed(2)}*`);
    lines.push('');
    lines.push('Grazie!');
    
    return lines.join('\n');
  };

  const handleSendOrder = async () => {
    const message = generateOrderMessage();
    
    if (!message) {
      alert('Seleziona almeno un prodotto per inviare l\'ordine');
      return;
    }
    
    // Track the order event before redirecting
    if (onTrackEvent) {
      const orderItems = items.filter(item => (quantities[item.product_id] || 0) > 0);
      
      for (const item of orderItems) {
        const qty = quantities[item.product_id] || 0;
        const price = parseFloat(item.products?.price) || 0;
        
        await onTrackEvent('click_whatsapp', {
          product_id: item.product_id,
          product_name: item.products?.name,
          quantity: qty,
          price: price,
          total: qty * price,
          weight_note: weightNotes[item.product_id] || null
        });
      }
    }
    
    // Generate WhatsApp link
    const phoneNumber = tenant.whatsapp_phone?.replace(/[^0-9]/g, '') || '';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/39${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    setShowSuccess(true);
    
    if (onOrderComplete) {
      onOrderComplete({
        message,
        totalValue: getTotalOrderValue(),
        itemCount: getTotalItems()
      });
    }
    
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="whatsapp-order-generator">
      <div className="order-header">
        <div className="order-title">
          <MessageCircle size={24} />
          <h3>Ordina via WhatsApp</h3>
        </div>
        <p className="order-subtitle">
          Seleziona le quantità e invia il tuo ordine direttamente su WhatsApp
        </p>
      </div>

      <div className="products-order-list">
        {items.map((item) => {
          const productId = item.product_id;
          const product = item.products;
          const qty = quantities[productId] || 0;
          const isWeightProduct = checkIsWeightProduct(product);
          const weightNote = weightNotes[productId] || '';
          
          return (
            <div key={productId} className="order-product-row">
              <div className="product-thumb">
                <img 
                  src={product?.image_url || '/placeholder-product.png'} 
                  alt={product?.name}
                />
              </div>
              
              <div className="product-details">
                <h4 className="product-name">{product?.name}</h4>
                <p className="product-price">{formatPrice(product?.price)}</p>
                
                {isWeightProduct && (
                  <div className="weight-note-input">
                    <Scale size={14} />
                    <input
                      type="text"
                      placeholder="Nota sul peso (es. 500g, 1kg)"
                      value={weightNote}
                      onChange={(e) => updateWeightNote(productId, e.target.value)}
                      className="weight-input"
                    />
                  </div>
                )}
              </div>
              
              <div className="quantity-controls">
                <button
                  className="qty-btn minus"
                  onClick={() => updateQuantity(productId, -1)}
                  disabled={qty === 0}
                >
                  <Minus size={16} />
                </button>
                
                <span className="qty-display">{qty}</span>
                
                <button
                  className="qty-btn plus"
                  onClick={() => updateQuantity(productId, 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="order-summary">
        <div className="summary-row">
          <span>Totale prodotti:</span>
          <span>{getTotalItems()} articoli</span>
        </div>
        <div className="summary-row total">
          <span>Totale ordine:</span>
          <span>{formatPrice(getTotalOrderValue())}</span>
        </div>
      </div>

      <button 
        className={`send-order-btn ${getTotalItems() === 0 ? 'disabled' : ''}`}
        onClick={handleSendOrder}
        disabled={getTotalItems() === 0}
      >
        <Send size={18} />
        Invia Ordine su WhatsApp
      </button>

      {showSuccess && (
        <div className="success-toast">
          ✓ Ordine inviato! Verrai reindirizzato su WhatsApp
        </div>
      )}

      <style jsx>{`
        .whatsapp-order-generator {
          background: var(--bg-secondary, #ffffff);
          border-radius: var(--radius-xl, 16px);
          padding: 24px;
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1));
          max-width: 600px;
          margin: 0 auto;
        }

        .order-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .order-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .order-title h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary, #0f172a);
        }

        .order-subtitle {
          font-size: 13px;
          color: var(--text-secondary, #64748b);
          margin: 0;
        }

        .products-order-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .order-product-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-primary, #f8fafc);
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--border-color, #e2e8f0);
        }

        .product-thumb {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-sm, 4px);
          overflow: hidden;
          flex-shrink: 0;
        }

        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-details {
          flex: 1;
          min-width: 0;
        }

        .product-name {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-price {
          font-size: 13px;
          color: var(--brand-primary, #A62B2B);
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .weight-note-input {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary, #64748b);
        }

        .weight-input {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius-sm, 4px);
          font-size: 12px;
          outline: none;
        }

        .weight-input:focus {
          border-color: var(--brand-primary, #A62B2B);
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--radius-full, 9999px);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast, 150ms);
        }

        .qty-btn.minus {
          background: var(--bg-secondary, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          color: var(--text-primary, #0f172a);
        }

        .qty-btn.plus {
          background: var(--brand-primary, #A62B2B);
          color: white;
        }

        .qty-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .qty-display {
          width: 32px;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
        }

        .order-summary {
          background: var(--bg-primary, #f8fafc);
          padding: 16px;
          border-radius: var(--radius-md, 8px);
          margin-bottom: 16px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .summary-row.total {
          font-size: 16px;
          font-weight: 700;
          color: var(--brand-primary, #A62B2B);
          margin-bottom: 0;
          padding-top: 8px;
          border-top: 1px solid var(--border-color, #e2e8f0);
        }

        .send-order-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: var(--radius-lg, 12px);
          background: #25D366;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: var(--transition-fast, 150ms);
        }

        .send-order-btn:hover:not(.disabled) {
          background: #128C7E;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1));
        }

        .send-order-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .success-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--success-color, #10b981);
          color: white;
          padding: 12px 24px;
          border-radius: var(--radius-full, 9999px);
          font-size: 14px;
          font-weight: 600;
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1));
          z-index: var(--z-toast, 1500);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (max-width: 640px) {
          .whatsapp-order-generator {
            padding: 16px;
          }

          .order-product-row {
            flex-wrap: wrap;
          }

          .product-details {
            flex: 1 1 calc(100% - 84px);
          }

          .quantity-controls {
            width: 100%;
            justify-content: center;
            padding-top: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppOrderGenerator;
