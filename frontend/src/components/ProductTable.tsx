import React, { useEffect, useState } from "react";
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  Table,
  IconButton,
  FormControl,
  InputLabel,
  ListItemText,
} from "@mui/material";
import { Product, Units } from "../types/Catalog";
import styled from "styled-components";
import IPageWrapper from "./IPageWrapper";
import { BackOfficeApiService } from "../services/back-office-api.service";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Store } from "./DistributionPointsTable";
//import MultiSelect from "./MultiSelect";

const ProductTable = () => {
  const [rows, setRows] = useState<Product[]>([]);
  const [newRow, setNewRow] = useState<Product>({
    id: 0,
    name: "",
    image: "",
    price: 0,
    status: false,
    unit: Units.kg,
    disabledStores: [],
  });
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [tempRowData, setTempRowData] = useState<any>();
  const apiService = new BackOfficeApiService();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [distributionPoints, setDistributionPoints] = useState<Store[]>([]);
  const [selectedDistributionPoints, setSelectedDistributionPoints] = useState<
    Store[]
  >([]);

  useEffect(() => {
    getProduct();
    getDistributionPoints();
  }, []);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (index != undefined && index >= 0) {
        const updatedTempRowData: Partial<Product> = {
          ...tempRowData,
          image: file,
          imagePreviewUrl: URL?.createObjectURL(file),
        };
        setTempRowData(updatedTempRowData);
      } else {
        const newRowImageData = {
          image: file,
          imagePreviewUrl: URL?.createObjectURL(file),
        };
        setNewRow({ ...newRow, ...newRowImageData });
      }
    }
  };

  const handleRemoveImage = async (index?: number) => {
    if (index != undefined && index >= 0) {
      const updatedTempRowData = {
        ...tempRowData,
        image: null,
        imagePreviewUrl: null,
      };
      setTempRowData(updatedTempRowData);
    } else {
      setNewRow({ ...newRow, image: null, imagePreviewUrl: null });
    }
    setSelectedImage(null);
  };

  const handleAddRow = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newRow.name);
      formData.append("price", newRow.price.toString());
      formData.append("status", newRow.status ? "true" : "false");
      formData.append("unit", newRow.unit);
      if (newRow.image) formData.append("image", newRow.image);
      await apiService.products.createProduct(formData);
      setRows([...rows, newRow]);
      setNewRow({
        id: 0,
        name: "",
        image: "",
        price: 0,
        status: false,
        unit: Units.kg,
        disabledStores: [],
      });
      setSelectedImage(null);
      toast.success("מוצר נוצר בהצלחה");
    } catch (e) {
      toast.error("הוספת מוצר נכשלה, אנא נסה נסית במועד מאוחר יותר");
      console.error("Error creating product:", e);
    }
  };

  const handleSaveRow = async () => {
    try {
      if (editingRow !== null && tempRowData) {
        const formData = new FormData();
        formData.append("name", tempRowData.name);
        formData.append("price", tempRowData.price.toString());
        formData.append("status", tempRowData.status ? "true" : "false");
        formData.append("unit", tempRowData.unit);
        formData.append(
          "disabledStoreIds",
          JSON.stringify(tempRowData.disabledStores) // Ensure this is correct when updating
        );
        if (tempRowData.image) formData.append("image", tempRowData.image);
  
        await apiService.products.updateProduct(tempRowData.id, formData as unknown as Product);
  
        const updatedRows = [...rows];
        updatedRows[editingRow] = tempRowData;
  
        setRows(updatedRows);
        setEditingRow(null);
        setTempRowData(null);
        toast.success("מוצר עודכן בהצלחה");
      }
    } catch (error) {
      toast.error("הוספת מוצר נכשלה, אנא נסה נסית במועד מאוחר יותר");
      console.error("Error updating product:", error);
    }
  };
  const handleNewRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = event.target;
    setNewRow({ ...newRow, [name]: type === "checkbox" ? checked : value });
  };

  const handleEditRowChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    if (tempRowData) {
      const updatedTempRowData = {
        ...tempRowData,
        [name]: type === "checkbox" ? checked : value,
      };
      setTempRowData(updatedTempRowData);
    }
  };

  const handleRowClick = (index: number) => {
    setEditingRow(index);
    setTempRowData({ ...rows[index] });
  };

  const getDistributionPoints = async () => {
    const points = await apiService.stores.getStores();
    setDistributionPoints(points);
  };

  const getProduct = async () => {
    const products = await apiService.products.getProducts();
    setRows(products);
  };

  const isAllFieldsFulfilled = () => {
    return newRow.name !== "" && newRow.price !== 0;
  };

  const renderRowInEditMode = (index: number) => {
    return (
      <>
        <TableCell>
          <Checkbox
            checked={tempRowData.status}
            onChange={handleEditRowChange}
            name="status"
          />
        </TableCell>
        <TableCell>{renderDistributionPointSelect(true)}</TableCell>

        <TableCell>
          <TextField
            variant="outlined"
            name="name"
            value={tempRowData.name}
            onChange={handleEditRowChange}
            size="small"
          />
        </TableCell>
        <TableCell>
          {tempRowData.imagePreviewUrl || tempRowData.image ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={tempRowData.imagePreviewUrl || tempRowData.image}
                alt="Preview"
                width="50"
              />
              <IconButton onClick={() => handleRemoveImage(index)}>
                {"x"}
              </IconButton>
            </div>
          ) : (
            <Button component="label" variant="contained">
              Upload
              <input
                type="file"
                hidden
                onChange={(event) => handleImageChange(event, index)}
              />
            </Button>
          )}
        </TableCell>
        <TableCell>
          <TextField
            type="number"
            variant="outlined"
            name="price"
            value={tempRowData.price}
            onChange={handleEditRowChange}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Select
            size="small"
            value={tempRowData.unit}
            name="unit"
            onChange={(event) =>
              setTempRowData({
                ...tempRowData,
                unit: event.target.value as Units,
              })
            }
          >
            {Object.values(Units).map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell>
          <Button variant="contained" onClick={handleSaveRow}>
            Save
          </Button>
        </TableCell>
      </>
    );
  };

  const renderNewRow = () => {
    return (
      <TableRow>
        <TableCell>
          <Checkbox
            checked={newRow.status}
            onChange={handleNewRowChange}
            name="status"
          />
        </TableCell>
        <TableCell>{renderDistributionPointSelect()}</TableCell>
        <TableCell>
          <TextField
            variant="outlined"
            name="name"
            value={newRow.name}
            onChange={handleNewRowChange}
            placeholder="Product Name"
            size="small"
          />
        </TableCell>
        <TableCell>
          {newRow.imagePreviewUrl ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={newRow.imagePreviewUrl} alt="Preview" width="50" />
              <IconButton onClick={() => handleRemoveImage()}>{"x"}</IconButton>
            </div>
          ) : (
            <Button component="label" variant="contained">
              Upload
              <input
                type="file"
                hidden
                onChange={(event) => handleImageChange(event)}
              />
            </Button>
          )}
        </TableCell>
        <TableCell>
          <TextField
            type="number"
            variant="outlined"
            name="price"
            value={newRow.price}
            onChange={handleNewRowChange}
            size="small"
            placeholder="Price"
          />
        </TableCell>
        <TableCell>
          <Select
            size="small"
            value={newRow.unit}
            name="unit"
            onChange={(event) =>
              setNewRow({ ...newRow, unit: event.target.value as Units })
            }
          >
            {Object.values(Units).map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell>
          <Button
            onClick={handleAddRow}
            variant="contained"
            disabled={!isAllFieldsFulfilled()}
          >
            Add
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  const handleDistributionPointChange = (event: any, isEditing = false) => {
    const value = event.target.value;
    
    // Handle stores selection for new row or for editing
    if (isEditing && tempRowData) {
      // Update the disabledStores for the edited row
      const updatedDisabledStores = [...tempRowData.disabledStores];
  
      value.forEach((storeId: number) => {
        if (!updatedDisabledStores.includes(storeId)) {
          updatedDisabledStores.push(storeId); // Add store if not already selected
        } else {
          updatedDisabledStores.splice(updatedDisabledStores.indexOf(storeId), 1); // Remove store if already selected
        }
      });
  
      setTempRowData({ ...tempRowData, disabledStores: updatedDisabledStores });
    } else {
      // Update the disabledStores for the new row
      const updatedDisabledStores = [...newRow.disabledStores];
  
      value.forEach((storeId: number) => {
        if (!updatedDisabledStores.includes(storeId)) {
          updatedDisabledStores.push(storeId); // Add store if not already selected
        } else {
          updatedDisabledStores.splice(updatedDisabledStores.indexOf(storeId), 1); // Remove store if already selected
        }
      });
  
      setNewRow({ ...newRow, disabledStores: updatedDisabledStores });
    }
  };
  
  const renderDistributionPointSelect = (isEditing = false) => (
    <FormControl fullWidth>
      <InputLabel>Distribution Points</InputLabel>
      <Select
        multiple
        value={isEditing ? tempRowData.disabledStores : newRow.disabledStores} // Use the correct state
        onChange={(event) => handleDistributionPointChange(event, isEditing)}
        renderValue={(selected) => selected.join(", ")}
      >
        {distributionPoints.map((point) => (
          <MenuItem key={point.id} value={point.id}>
            <Checkbox
              checked={
                isEditing
                  ? tempRowData.disabledStores.includes(point.id) // Check against tempRowData.disabledStores
                  : newRow.disabledStores.includes(point.id) // Check against newRow.disabledStores
              }
            />
            <ListItemText primary={point.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
  
  
  return (
    <PageWrapper>
      <ToastContainer position="top-center" />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>הסר מנקודות חלוקה</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={index}
                onClick={() => handleRowClick(index)}
                hover
                selected={editingRow === index}
              >
                {editingRow === index && tempRowData ? (
                  renderRowInEditMode(index)
                ) : (
                  <>
                    <TableCell>{row.status ? "Active" : "Inactive"}</TableCell>
                    <TableCell>
                      {(row.disabledStores || []).join(", ")}
                    </TableCell>

                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <img src={row.image} alt={row.name} width="50" />
                    </TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleRowClick(index)}
                        variant="contained"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {renderNewRow()}
          </TableBody>
        </Table>
      </TableContainer>
    </PageWrapper>
  );
};

const PageWrapper = styled(IPageWrapper)`
  padding: 2rem;
`;

export default ProductTable;
