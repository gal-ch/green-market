import styled from "styled-components";
import Icon from "./Icon";
import { useStore } from "../stores/StoreContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { productStore } = useStore();
  const navigate = useNavigate();

  return (
    <RowButtons>
      <p onClick={() => navigate("/cart")}>
        <CartIcon>
          <Icon type="cart" style={{ icon: { height: 44 } }} />
          <span className="cart-count">{productStore.cartProducts.length}</span>
        </CartIcon>
      </p>
      <Icon
        onClick={() => navigate("/")}
        type="home"
        style={{ icon: { height: 44, cursor: "pointer" } }}
      />

      <Button
        variant="contained"
        onClick={() => {
          navigate("/login");
        }}
      >
        התחבר
      </Button>
      {/* <div>
        <h1>Back Office Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div> */}
    </RowButtons>
  );
};

const CartIcon = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;


  .cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #d9d8d8;
    color: #252424;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
`;

const RowButtons = styled.div`
  display: flex;
  justify-content: right;
  gap: 16px;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
  z-index: 3;
`;

export default NavBar;
