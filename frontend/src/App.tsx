import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Catalog from "./pages/Catalog";
import styled from "styled-components";
import NavBar from "./components/NavBar";
import Cart from "./pages/Cart";
import AdminSettings from "./pages/AdminSettings/AdminSettings";
import { StoreContext, StoreProvider, useStore } from "./stores/StoreContext";
import dayjs from "dayjs";
import { AppApiService } from "./services/app-api.service";
import { BackOfficeLogin } from "./pages/backOfficeLogin/BackOfficeLogin";
import SiteDetailsModal from "./components/SiteDetailsModal";
import { AuthProvider } from "./context/AuthContext";
import Registration from "./pages/backOfficeLogin/BackOfficeSignin";
import SelectDistributionPointModal from "./components/SelectDistributionPointModal";
import { Button } from "@mui/material";
import './types/variables.css';
const App: React.FC = () => {
  const apiService = new AppApiService();
  const [name, setName] = useState<string | undefined>(undefined);
  const location = useLocation();
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [freeTextModal, setFreeTextModal] = useState<string>("");
  const [freeTextIsOpen, setFreeTextIsOpen] = useState<boolean>(true);
  const [showDistributionPointModal, setShowDistributionPointModal] = useState(
    Object.keys(localStorage.getItem("distributionPoint") || {}).length === 0 ||
      location.pathname !== "/admin-settings"
  );

  const { productStore } = useStore();
  useEffect(() => {
    getSiteDetailsSettings();
  }, [location.pathname]);

  useEffect(() => {
    if (!showDistributionPointModal) {
      productStore?.removeAllProductsFromCart();
    }
  }, []);

  const getSiteDetailsSettings = async () => {
    const { settings } = await apiService.account.getAccount(1);
    const today = dayjs();
    const todayHour = today.hour();
    const isClosed =
      location.pathname !== "/admin-settings" &&
      today.isAfter(dayjs(settings?.closingDate)) &&
      todayHour > +settings?.closingHour;
    setIsClosed(isClosed);
    setFreeTextModal(settings.freeText || "");
    const isApp = location.pathname !== "/admin-settings";

    setName(settings.name);
    if (
      settings?.closingDate &&
      today > dayjs(settings?.closingDate) &&
      todayHour > +settings.closingHour &&
      isApp
    ) {
      return;
    }
  };

  const onChangeDistributionPoint = () => {
    productStore?.removeAllProductsFromCart();
  };

  return (
    <AuthProvider>
      <StoreProvider>
        <PageWrapper>
          <NavBar />
          <SiteHeader />
          <ImageWrapper>
            <img
              src={require("./assets/images/main.jpg")}
              className="top-image"
              alt="Main"
            />
            <h2>{name}</h2>
          </ImageWrapper>
          <Button onClick={() => setShowDistributionPointModal(true)}>
            שנה נקודת חלוקה
          </Button>

          <SiteDetailsModal
            isOpen={freeTextIsOpen && location.pathname !== "/admin-settings"}
            onClose={() => setFreeTextIsOpen(false)}
            modalText={freeTextModal}
          />

          <SelectDistributionPointModal
            hasDistributionPoint={showDistributionPointModal}
            isOpen={showDistributionPointModal}
            onClose={() => setShowDistributionPointModal(false)}
            onChangeDistributionPoint={onChangeDistributionPoint}
          />

          <Overlay isOpen={isClosed}>
            {isClosed && "האתר סגור כעת, אנא נסו שנית במועד מאוחר יותר"}
          </Overlay>
          <Routes>
            <Route path="/cart" element={<Cart />} />
            <Route path="/" element={<Catalog />} />
            <Route
              path="/admin-settings"
              element={
                // <ProtectedRoute>
                <AdminSettings />
                //   </ProtectedRoute>
              }
            />
            <Route path="/login" element={<BackOfficeLogin />} />
            <Route path="/register" element={<Registration />} />
          </Routes>
        </PageWrapper>
      </StoreProvider>
    </AuthProvider>
  );
};

const PageWrapper = styled.div`
  background-color: #837e7241;
  position: relative;
  h3,
  h2,
  p,
  label,text {
    color:var(--text-color);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  text-align: center;

  .top-image {
    height: 300px;
    width: 100%;
    object-fit: cover;
    position: relative;
    z-index: 1;
  }

  h2 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 2rem;
    z-index: 2;
  }
`;

const SiteHeader = styled.div``;

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
  color: white;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  text-align: center;
`;

export default App;
