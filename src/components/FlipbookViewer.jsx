/**
 * Flipbook 3D Viewer Component
 * High-performance 3D page-flipping viewer with lazy loading
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Printer, Share2, X, Smartphone } from 'lucide-react';

const FlipbookViewer = ({ 
  catalog, 
  items, 
  tenant, 
  onClose,
  onTrackEvent 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedPages, setLoadedPages] = useState(new Set([0]));
  const flipbookRef = useRef(null);

  // Calculate pages from items
  const pages = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const maxPage = Math.max(...items.map(item => item.page_number || 1));
    const pagesArray = [];
    
    for (let i = 1; i <= maxPage; i++) {
      const pageItems = items.filter(item => (item.page_number || 1) === i);
      pagesArray.push({
        pageNumber: i,
        items: pageItems
      });
    }
    
    return pagesArray;
  }, [items]);

  // Track view event
  useEffect(() => {
    if (onTrackEvent && currentPage === 0) {
      onTrackEvent('view_catalog', { 
        catalog_id: catalog?.id,
        catalog_name: catalog?.name 
      });
    }
  }, []);

  // Lazy load images for current and adjacent pages
  useEffect(() => {
    const pagesToLoad = [
      currentPage,
      currentPage - 1,
      currentPage + 1
    ].filter(p => p >= 0 && p < pages.length);

    pagesToLoad.forEach(pageIndex => {
      if (!loadedPages.has(pageIndex)) {
        const page = pages[pageIndex];
        if (page?.items) {
          page.items.forEach(item => {
            if (item.products?.image_url) {
              const img = new Image();
              img.src = item.products.image_url;
              img.onload = () => {
                setLoadedPages(prev => new Set([...prev, pageIndex]));
              };
            }
          });
        }
      }
    });
  }, [currentPage, pages, loadedPages]);

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (!catalog || pages.length === 0) {
    return null;
  }

  return (
    <div className="flipbook-overlay" ref={flipbookRef}>
      <div className="flipbook-container">
        {/* Header Controls */}
        <div className="flipbook-header">
          <div className="flipbook-title">
            <h3>{catalog.name}</h3>
            <span className="business-name">{tenant?.business_name}</span>
          </div>
          
          <div className="flipbook-actions">
            <button 
              className="action-btn"
              onClick={handlePrint}
              title="Stampa o salva PDF"
            >
              <Printer size={18} />
              <span>Stampa</span>
            </button>
            
            <button 
              className="action-btn"
              title="Condividi"
            >
              <Share2 size={18} />
              <span>Condividi</span>
            </button>
            
            <button 
              className="action-btn close-btn"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 3D Flipbook Viewer */}
        <div className="flipbook-content">
          <button 
            className="nav-btn prev-btn"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flipbook-page active">
            <div className="page-content">
              {/* Page Header */}
              <div className="flyer-sheet-header" style={{ 
                borderBottomColor: tenant?.brand_colors?.primary || '#A62B2B' 
              }}>
                {tenant?.logo_url && (
                  <img 
                    src={tenant.logo_url} 
                    alt={tenant.business_name}
                    className="flyer-logo"
                  />
                )}
                <div>
                  <h1>{tenant?.business_name}</h1>
                  <p>Pagina {currentPage + 1} di {pages.length}</p>
                </div>
              </div>

              {/* Products Grid */}
              <div className="products-grid-layout">
                {pages[currentPage]?.items.map((item, index) => (
                  <div key={item.id || index} className="grid-product-card">
                    <div className="card-img-wrapper">
                      <img
                        src={item.products?.image_url || '/placeholder-product.png'}
                        alt={item.products?.name}
                        className="card-img"
                        loading={loadedPages.has(currentPage) ? 'eager' : 'lazy'}
                      />
                    </div>
                    <div className="card-body">
                      <h4 className="product-name-truncated">
                        {item.products?.name}
                      </h4>
                      <p className="product-desc-truncated">
                        {item.products?.description}
                      </p>
                      <div className="card-footer">
                        <span className="price-tag">
                          {formatPrice(item.products?.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            className="nav-btn next-btn"
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Page Navigation */}
        <div className="flipbook-footer">
          <div className="page-indicator">
            <span>Pagina {currentPage + 1} di {pages.length}</span>
          </div>
          
          <div className="page-thumbnails">
            {pages.map((_, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentPage ? 'active' : ''}`}
                onClick={() => goToPage(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View Toggle */}
        <button className="mobile-view-toggle" title="Vista mobile">
          <Smartphone size={18} />
        </button>
      </div>

      <style jsx>{`
        .flipbook-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: var(--z-modal, 1300);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .flipbook-container {
          width: 100%;
          max-width: 1200px;
          height: 90vh;
          background: #ffffff;
          border-radius: var(--radius-xl, 12px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .flipbook-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-secondary, #ffffff);
        }

        .flipbook-title h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }

        .flipbook-title .business-name {
          font-size: 12px;
          color: var(--text-secondary, #64748b);
        }

        .flipbook-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-primary, #f8fafc);
          border-radius: var(--radius-md, 6px);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: var(--transition-fast, 150ms);
        }

        .action-btn:hover {
          background: var(--bg-tertiary, #f1f5f9);
        }

        .close-btn {
          background: transparent;
          border: none;
          padding: 8px;
        }

        .flipbook-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 24px;
          background: var(--bg-primary, #f8fafc);
          overflow: hidden;
        }

        .nav-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: var(--brand-primary, #A62B2B);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast, 150ms);
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1));
        }

        .nav-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1));
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .flipbook-page {
          flex: 1;
          max-width: 100%;
          height: 100%;
          overflow: auto;
        }

        .page-content {
          background: white;
          padding: 40px;
          min-height: 750px;
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1));
        }

        .flyer-sheet-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 20px;
          margin-bottom: 30px;
          border-bottom: 3px solid;
        }

        .flyer-logo {
          max-height: 50px;
          object-fit: contain;
        }

        .flyer-sheet-header h1 {
          font-size: 24px;
          font-weight: 800;
          margin: 0;
        }

        .flyer-sheet-header p {
          font-size: 13px;
          color: var(--text-secondary, #64748b);
          margin: 4px 0 0 0;
        }

        .products-grid-layout {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .grid-product-card {
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: var(--transition-fast, 150ms);
        }

        .grid-product-card:hover {
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1));
          transform: translateY(-2px);
        }

        .card-img-wrapper {
          width: 100%;
          height: 160px;
          overflow: hidden;
          background: var(--bg-primary, #f8fafc);
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-normal, 250ms);
        }

        .grid-product-card:hover .card-img {
          transform: scale(1.05);
        }

        .card-body {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-name-truncated {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 6px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-desc-truncated {
          font-size: 11px;
          color: var(--text-secondary, #64748b);
          margin: 0 0 12px 0;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .price-tag {
          font-size: 18px;
          font-weight: 700;
          color: var(--brand-primary, #A62B2B);
        }

        .flipbook-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-secondary, #ffffff);
        }

        .page-indicator span {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary, #64748b);
        }

        .page-thumbnails {
          display: flex;
          gap: 6px;
        }

        .thumbnail {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-primary, #f8fafc);
          border-radius: var(--radius-sm, 4px);
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast, 150ms);
        }

        .thumbnail:hover {
          background: var(--bg-tertiary, #f1f5f9);
        }

        .thumbnail.active {
          background: var(--brand-primary, #A62B2B);
          color: white;
          border-color: var(--brand-primary, #A62B2B);
        }

        .mobile-view-toggle {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: var(--brand-primary, #A62B2B);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.1));
        }

        @media (max-width: 768px) {
          .flipbook-overlay {
            padding: 0;
          }

          .flipbook-container {
            height: 100vh;
            max-width: 100%;
            border-radius: 0;
          }

          .flipbook-content {
            padding: 12px;
          }

          .nav-btn {
            width: 40px;
            height: 40px;
          }

          .page-content {
            padding: 20px;
            min-height: auto;
          }

          .products-grid-layout {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .flipbook-header,
          .flipbook-footer {
            padding: 12px 16px;
          }
        }

        @media print {
          .flipbook-overlay {
            position: static;
            background: white;
          }

          .flipbook-container {
            height: auto;
            max-width: 100%;
          }

          .flipbook-header,
          .flipbook-footer,
          .nav-btn,
          .mobile-view-toggle {
            display: none !important;
          }

          .flipbook-content {
            display: block;
            padding: 0;
          }

          .flipbook-page {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
};

export default FlipbookViewer;
