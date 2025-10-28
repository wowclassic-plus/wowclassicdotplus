import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogContent,
} from "@mui/material";

function PinForm({
  description,
  setDescription,
  name,
  setName,
  category,
  setCategory,
  categories = [],
  onSave,
  onCancel,
}) {
  return (
    <Dialog open={true} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box sx={{ p: 1 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Add New Pin
            </Typography>
            
            <TextField
              label="Pin Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter pin name"
              size="small"
              fullWidth
              autoFocus
              sx={{
                '& .MuiInputBase-input': {
                  color: 'text.primary', // Black text for input
                },
                '& .MuiInputLabel-root': {
                  color: 'text.primary', // Label color
                },
              }}
            />
            
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              multiline
              rows={3}
              size="small"
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  color: 'text.primary', // Black text for input
                },
                '& .MuiInputLabel-root': {
                  color: 'text.primary', // Label color
                },
              }}
            />
            
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              size="small"
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  color: 'text.primary', // Black text for input
                },
                '& .MuiInputLabel-root': {
                  color: 'text.primary', // Label color
                },
                '& .MuiMenuItem-root': {
                  color: 'text.primary', // Black text for menu items
                },
              }}
            >
              {categories.length === 0 ? (
                <MenuItem disabled value="">
                  Loading categories...
                </MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))
              )}
            </TextField>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                onClick={onSave}
                variant="contained"
                color="primary"
                fullWidth
                disabled={!name || !description}
              >
                Save
              </Button>
              <Button
                onClick={onCancel}
                variant="outlined"
                fullWidth
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default PinForm;