import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

// Styled components for consistent table styling
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 0,
  overflow: 'auto',
  boxSizing: 'border-box',
  
  // Override global table cell styles that force problematic flex layout
  '& .MuiTableCell-root': {
    padding: `${theme.spacing(2)} !important`,
  },
  
  '& .MuiTableCell-root > *': {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
  },
  
  '& .MuiTableCell-root .MuiBox-root': {
    display: 'inline-flex',
    alignItems: 'center',
  },
  
  '& .MuiTableCell-paddingCheckbox': {
    width: '50px',
    padding: `${theme.spacing(1)} !important`,
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  fontSize: '0.875rem',
  fontWeight: 500,
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  verticalAlign: 'middle',
  height: 'auto',
  minHeight: '56px',
  boxSizing: 'border-box',
  
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.grey[50],
    fontWeight: 600,
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    verticalAlign: 'middle',
    height: '56px',
    whiteSpace: 'nowrap',
  },
  
  '&.MuiTableCell-body': {
    verticalAlign: 'middle',
    height: 'auto',
    minHeight: '56px',
    whiteSpace: 'nowrap',
  },
  
  // Special handling for checkboxes
  '&.MuiTableCell-paddingCheckbox': {
    width: '50px',
    padding: theme.spacing(1),
    '& > *': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td': {
    borderBottom: 0,
  },
}));

// Removed DataCell wrapper to prevent layout conflicts
// Content is now rendered directly in TableCell

const TruncatedText = styled(MDTypography)(({ maxWidth = 200 }) => ({
  maxWidth: `${maxWidth}px`,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

// Enhanced Table Component
function EnhancedTable({
  columns = [],
  data = [],
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  showCheckbox = false,
  stickyHeader = false,
  maxHeight = 'auto',
  responsive = true,
}) {
  const allSelected = data.length > 0 && selectedItems.length === data.length;
  const indeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  const handleSelectAll = (event) => {
    if (onSelectAll) {
      onSelectAll(event.target.checked);
    }
  };

  const handleSelectItem = (item) => (event) => {
    if (onSelectItem) {
      onSelectItem(item, event.target.checked);
    }
  };

  return (
    <StyledTableContainer sx={{ maxHeight, overflow: 'auto' }}>
      <Table 
        stickyHeader={stickyHeader} 
        size="medium" 
        sx={{ 
          width: '100%',
          tableLayout: 'auto',
        }}
      >
        <TableBody>
          {data.map((row, index) => (
            <StyledTableRow key={row.id || index}>
              {showCheckbox && (
                <StyledTableCell 
                  padding="checkbox"
                >
                  <Checkbox
                    checked={selectedItems.some(item => item.id === row.id)}
                    onChange={handleSelectItem(row)}
                    color="primary"
                  />
                </StyledTableCell>
              )}
              {columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ 
                    minWidth: column.minWidth || 'auto',
                  }}
                >
                  {column.format ? column.format(row[column.id], row) : (
                    <TruncatedText
                      variant="body2"
                      maxWidth={column.maxWidth || 200}
                      title={String(row[column.id])}
                    >
                      {row[column.id]}
                    </TruncatedText>
                  )}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
          {data.length === 0 && (
            <StyledTableRow>
              <StyledTableCell colSpan={columns.length + (showCheckbox ? 1 : 0)} align="center">
                <MDBox py={4}>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    No data available
                  </MDTypography>
                </MDBox>
              </StyledTableCell>
            </StyledTableRow>
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
}

export default EnhancedTable;
