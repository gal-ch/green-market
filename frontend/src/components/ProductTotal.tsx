import React, { useContext, useState } from "react";
import styled from "styled-components";
import { Currency, Product } from "../types/Catalog";
import Icon from "./Icon";
import { StoreContext, useStore } from "../stores/StoreContext";

interface IProductCard {
  product: Product;
  quantity: number;
  onQuantityChange: (id: number, quantity: number) => void;
}

const ProductTotal: React.FC<IProductCard> = ({
  product,
  quantity,
  onQuantityChange,
}) => {
  const [newQuantity, setNewQuantity] = useState(quantity);
  const { productStore } = useStore();

  const handleIncrease = () => {
    setNewQuantity((prevQuantity) => {
      const updatedQuantity = prevQuantity + 1;
      onQuantityChange(product.id, updatedQuantity);
      return updatedQuantity;
    });
  };

  const handleDecrease = () => {
    setNewQuantity((prevQuantity) => {
      const updatedQuantity = Math.max(prevQuantity - 1, 0);
      onQuantityChange(product.id, updatedQuantity);
      return updatedQuantity;
    });
  };

  const removeProductFromCart = () => {
    productStore?.removeFromCart(product);
  };

  return (
    <ProductCardWrapper>
      <LeftSide>
        <Icon
          style={{ icon: { width: 24, cursor: "pointer" } }}
          onClick={removeProductFromCart}
          type="trash"
          className="icon-trash"
          aria-label={`Remove ${product.name} from cart`}
        />
        <Price>
          {Currency.ILS} {product.price * newQuantity}
        </Price>
      </LeftSide>
      <QuantityControls>
        <button
          className="quantity-button"
          onClick={handleDecrease}
          disabled={newQuantity <= 0}
          aria-label={`Decrease quantity of ${product.name}`}
        >
          -
        </button>
        <span className="quantity-display">{newQuantity}</span>
        <button
          className="quantity-button"
          onClick={handleIncrease}
          aria-label={`Increase quantity of ${product.name}`}
        >
          +
        </button>
      </QuantityControls>
      <RightSide>
        <div>
          <h2 className="product-name">{product.name}</h2>
          <p className="product-price">
            {Currency.ILS} {product.price}
          </p>
        </div>
        <img src={product.image} alt={product.name} className="product-image" />
      </RightSide>
    </ProductCardWrapper>
  );
};

const ProductCardWrapper = styled.div`
  border: 1px solid var(--border-color);
  background-color: var(--card-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row;
  // align-items: center;
  padding: 32px;
  gap: 16px;
  justify-content: space-between;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
  }
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  flex-direction: column;
  justify-content: start;
  gap: 22px;
  margin-right: 32px;
  position: absolute;

  .icon-trash {
    align-self: flex-start;
    cursor: pointer;
  }
`;

const Price = styled.p`
  font-size: 20px;
  color: #333;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-left: 170px;
  .quantity-button {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: #545454;
    font-size: 1.2em;
    width: 32px;
    padding: 4px 8px;
    background-color: var(--action-color);
    cursor: pointer;
    transition: background-color 0.3s;
    &:disabled {
      background-color: var(--disabled-background);
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: #e6e6e6;
    }
  }

  .quantity-display {
    font-size: 1.2em;
    margin: 0 16px;
  }
`;

const RightSide = styled.div`
  gap: 32px;
  display: flex;
  align-items: center;
  text-align: right;
  
`;

export default ProductTotal;
