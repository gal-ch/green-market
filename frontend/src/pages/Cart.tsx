import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import ProductTotal from "../components/ProductTotal";
import TotalSummary from "../components/TotalSummary";
import { StoreContext, useStore } from "../stores/StoreContext";

const Cart: React.FC = () => {
  const {productStore} = useStore();
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const product = productStore?.cartProducts.find(
      (p) => p.product.id === productId
    )?.product;
    if (product) {
      productStore?.addToCart(product, newQuantity);
      let totalPrice = 0;
      productStore?.cartProducts.forEach(
        (item) => (totalPrice += item.product.price * item.quantity)
      );
      setTotalPrice(totalPrice);
    }
  };

  const orderDetails = [{
    productName: 'fdsfdsf',
    amount: 12,
    price: 12
  }]

  return (
    <CatalogWrapper>
      <Header>ההזמנה שלך</Header>
      <div className="summary">
        <TotalSummary  />
        <LeftSide>
          <CardWrapper>
            {productStore?.cartProducts.map(({ product, quantity }) => (
              <ProductTotal
                key={product.id}
                product={product}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </CardWrapper>
        </LeftSide>
      </div>
    </CatalogWrapper>
  );
};

export default Cart;

const CatalogWrapper = styled.div`
  height: calc(100% - 24px);
  overflow: auto;
  padding: 32px;
  justify-content: center;
  .summary {
    display: flex;
    align-items: start;
    justify-content: center;
  }

`;

const LeftSide = styled.div``;

const CardWrapper = styled.div`
width: 760px;

`;

const Header = styled.div`
  display: flex;
  border: 1px;
  justify-content: center;
  padding: 24px;
  font-size: 32px;
  font-weight: bolder;
  color: #5e5e5e;
`;
