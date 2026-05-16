'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/cartcontext';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const outOfStock = product.stock_available === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!outOfStock) {
      addToCart(product, 1);
      alert("1 unit added to your shopping cart!");
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="product-card-anchor">
      <div className="product-card-surface">
        
        {/* Card Header Top Accent Block */}
        <div className="product-card-banner">
          <span>🌾</span>
          <span>Fresh Item</span>
        </div>

        {/* Card Content Matrix Block */}
        <div className="product-card-body">
          <h3>{product.name}</h3>
          
          <div className="price-matrix-block">
            QA/Price: ₹{product.price} <span>/ kg</span>
          </div>

          <div className="metadata-rows-list">
            <div className="metadata-row-item">👤 Farmer: {product.farmer_name || 'Local Producer'}</div>
            <div className="metadata-row-item">📍 Origin: {product.farmer_city || 'Nearby Farm'}</div>
            <div className="metadata-row-item">🧭 Distance: {product.distance_km || '2.4'} km away</div>
          </div>

          {/* Action Footer Row Option */}
          <div className="product-card-footer">
            <span className="stock-counter-label">
              {product.stock_available || 10} units left
            </span>
            <button onClick={handleAddToCart} className="action-add-cart-btn">
              🛒 Add to Cart
            </button>
          </div>
        </div>

      </div>
    </Link>
  );
}