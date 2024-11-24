import axios from "axios";
import { Account, Product } from "../types/Catalog";
import { Store } from "../components/DistributionPointsTable";
import { CartItem } from "../stores/ProductStore";

const API_URL = "http://localhost:3002";
const token = localStorage.getItem("token");

export class AppApiService {
  constructor() {}
  private get authHeader() {
    return { Authorization: token };
  }
  get stores() {
    return {
      getStores: async (): Promise<Store[]> => {
        const response = await axios.get(`${API_URL}/stores/findAllActive/`);
        return response.data;
      },
      getStoreById: async (id: number): Promise<Store[]> => {
        const response = await axios.get(`${API_URL}/stores/${id}`);
        return response.data;
      },
    };
  }
  get products() {
    return {
      getProducts: async (): Promise<Product[]> => {
        const response = await axios.get(`${API_URL}/products`);
        return response.data;
      },
      getProductById: async (id: number): Promise<Product[]> => {
        const response = await axios.get(`${API_URL}/products/${id}`);
        return response.data;
      },
    };
  }
  get account() {
    return {
      getAccount: async (id: number): Promise<Account> => {
        const response = await axios.get(`${API_URL}/account/${id}`);
        return response.data;
      },
    };
  }
  get orders() {
    return {
      checkout: async ({
        orderDetails,
        cardDetails,
      }: {
        cardDetails: {
          creditCardNumber: string;
          creditCardCvv: string;
          creditCardExpiration: string;
          citizenID: string;
        },
        orderDetails: {
          clientName: string;
          clientEmail: string;
          clientPhoneNumber: number;
          store: number;
          details: CartItem[];
        };
      }): Promise<any> => {
        const requestBody = {
          orderDetails,
          cardDetails,
        };

        try {
          const response = await axios.post(
            `${API_URL}/orders/create`, // The API endpoint
            requestBody, // The request body with necessary data
            { headers: this.authHeader } // Authentication headers
          );

          return response.data; // Return the response data
        } catch (error) {
          // Handle error appropriately (e.g., log it, throw a custom error, etc.)
          throw new Error("Error while creating the order: " + error);
        }
      },
    };
  }
}
