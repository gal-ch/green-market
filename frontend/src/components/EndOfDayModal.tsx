import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Box,
  Button,
  Checkbox,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,  // Import CircularProgress for the loading spinner
} from "@mui/material";
import { Store } from "./DistributionPointsTable";
import { BackOfficeApiService } from "../services/back-office-api.service";
import { useStore } from "../stores/StoreContext";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid var(--border-color)",
  boxShadow: 24,
  p: 4,
};

interface IEndOfDayModal {
  isOpen: boolean;
  todayDistributionPoint: Store[];
  onClose: () => void;
}

const EndOfDayModal: React.FC<IEndOfDayModal> = ({
  isOpen,
  todayDistributionPoint,
  onClose,
}) => {
  const [open, setOpen] = useState(isOpen);
  const [selectedPoints, setSelectedPoints] = useState<number[]>([]); // Array of store IDs
  const [loading, setLoading] = useState(false);  // State to track loading status
  const apiService = new BackOfficeApiService();
  const getDaysMap = {
    Sunday: "ראשון",
    Monday: "שני",
    Tuesday: "שלישי",
    Wednesday: "רביעי",
    Thursday: "חמישי",
    Friday: "שישי",
    Saturday: "שבת",
  } as Record<string, string>;

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleCheckboxChange = (pointId: number) => {
    setSelectedPoints((prevSelected) =>
      prevSelected.includes(pointId)
        ? prevSelected.filter((id) => id !== pointId)
        : [...prevSelected, pointId]
    );
  };

  const handleSave = async () => {
    if (selectedPoints.length) {
      setLoading(true); // Set loading to true when the request starts
      try {
        await apiService.stores.closeStoreEndOfDayAndSendEmail(selectedPoints);
      } catch (error) {
        console.error("Error closing store end of day:", error);
      } finally {
        setLoading(false); // Set loading to false when the request is complete
        setOpen(false);
        onClose(); // Close the modal after the operation
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={(e: React.MouseEvent) => e.preventDefault()} // Prevent closing the modal
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" id="modal-modal-title">
          סגירת יום
        </Typography>
        <Typography id="modal-modal-description" sx={{ mb: 2 }}>
          בחר את הנקודות בהן תרצה לסגור את ההזמנות
        </Typography>

        <ContentContainer>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Select</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Day</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todayDistributionPoint.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedPoints.includes(point.id)}
                        onChange={() => handleCheckboxChange(point.id)}
                      />
                    </TableCell>
                    <TableCell>{point.name}</TableCell>
                    <TableCell>{point.address}</TableCell>
                    <TableCell>
                      {getDaysMap[point.day] as unknown as string}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Show the Save button or loading spinner based on the loading state */}
          {loading ? (
            <CircularProgress />  // Display a loading spinner while waiting
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mt: 2 }}
              disabled={loading}  // Disable button while loading
            >
              Save
            </Button>
          )}
        </ContentContainer>
      </Box>
    </Modal>
  );
};

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export default EndOfDayModal;
