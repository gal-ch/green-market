import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Order } from "./OrdersTable";
import Icon from "./Icon";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import styled from "styled-components";
import IPageWrapper from "./IPageWrapper";
import { DropDownOptionListType, DropDownSelectOption } from "../types/Catalog";
import { BackOfficeApiService } from "../services/back-office-api.service";
import MultiSelect from "./MultiSelect";
import { set } from "date-fns";
import { useStore } from "../stores/StoreContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ProductPickup {
  productName: string;
  totalAmount: number;
}

const CollectionTable: React.FC = () => {
  const apiService = new BackOfficeApiService();
  const { backOfficeStore } = useStore();

  const [pickupData, setPickupData] = useState<ProductPickup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDistributionPoints, setSelectedDistributionPoints] = useState<
    DropDownOptionListType[]
  >([]);
  const [selectedProductNames, setSelectedProductNames] = useState<
    DropDownOptionListType[]
  >([]);

  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date() || ""
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date() || "");

  useEffect(() => {
    backOfficeStore.fetchProducts();
    backOfficeStore.fetchDistributionPoints();
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate, selectedDistributionPoints, selectedProductNames]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const filters = {
        distributionPoints: selectedDistributionPoints.map(
          (point) => point.value
        ),
        products: selectedProductNames.map((product) => product.value),
      };
      const ordersRecord: Record<number, Order[]> =
        await apiService.orders.getOrders(
          startDate?.toLocaleDateString() || "",
          endDate?.toLocaleDateString() || "",
          filters
        );
      const productPickupMap: { [productName: string]: number } = {};
      const orders: Order[] = Object.values(ordersRecord).flat();
      orders.forEach((order) => {
        order.details.forEach((detail) => {
          if (productPickupMap[detail.productName]) {
            productPickupMap[detail.productName] += detail.amount;
          } else {
            productPickupMap[detail.productName] = detail.amount;
          }
        });
      });

      const aggregatedData = Object.keys(productPickupMap).map(
        (productName) => ({
          productName,
          totalAmount: productPickupMap[productName],
        })
      );

      setPickupData(aggregatedData);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onExport = async () => {
    setIsLoading(true);
    try {
      const today = dayjs().format("DD/MM/YYYY");
      const filters = {
        distributionPoints: selectedDistributionPoints.map(
          (point) => point.value
        ),
        products: selectedProductNames.map((product) => product.value),
      };
      const report = await apiService.orders.exportReport(
        startDate?.toLocaleDateString() || "",
        endDate?.toLocaleDateString() || "",
        filters
      );
      if (typeof report !== "string" || !/^[A-Za-z0-9+/=]+$/.test(report)) {
        throw new Error("Invalid base64 string received");
      }
      const blob = Uint8Array.from(atob(report), (c) => c.charCodeAt(0));
      saveAs(new Blob([blob]), `orders-Cash-${today}.xlsx`);
    } catch (error: any) {
      console.error(`failed export report: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <TabWrapper>
        <ButtonsNav>
          <DateRangePickerWrapper>
            <div>
              <label
                htmlFor="start-date"
                style={{ marginBottom: "4px", display: "block" }}
              >
                תאריך התחלה
              </label>
              <DatePicker
                id="start-date"
                selected={startDate}
                onChange={(date) => setStartDate(date || undefined)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <span style={{ marginTop: "24px" }}>to</span>
            <div>
              <label
                htmlFor="end-date"
                style={{ marginBottom: "4px", display: "block" }}
              >
                תאריך סיום
              </label>
              <DatePicker
                id="end-date"
                selected={endDate}
                onChange={(date) => setEndDate(date || undefined)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </DateRangePickerWrapper>
          {/* <MultiSelect
            label="מוצרים"
            selectedOptions={selectedProductNames}
            options={backOfficeStore.products.map((product) => ({
              value: product.id,
              label: product.name,
            }))}
            onChange={(options) => setSelectedProductNames(options)}
          /> */}
          <MultiSelect
            label="נקודות איסוף"
            selectedOptions={selectedDistributionPoints}
            options={backOfficeStore.distributionPoints.map((point) => ({
              value: point.id,
              label: point.name,
            }))}
            onChange={(options) => setSelectedDistributionPoints(options)}
          />
          <Icon
            style={{ icon: { width: "24px", cursor: "pointer" } }}
            type="export"
            onClick={onExport}
          />
        </ButtonsNav>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>שם מוצר</TableCell>
                <TableCell>כמות כוללת</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                pickupData.map((product) => (
                  <TableRow key={product.productName}>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.totalAmount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabWrapper>
    </PageWrapper>
  );
};
const PageWrapper = styled(IPageWrapper)`
  height: calc(100% - 24px);
  min-height: 700px;
  overflow: auto;
  th,
  td {
    text-align: right;
    width: fit-content;
  }
`;

const TabWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: end;
`;

const ButtonsNav = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  width: 600px;
`;
const DateRangePickerWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px; /* Space between date pickers */
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 4px;
  color: #555;
  display: block;
`;

export default CollectionTable;
