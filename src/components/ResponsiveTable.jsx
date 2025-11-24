/**
 * Responsive Table Component for DriveCash
 * Handles table display across different device sizes
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Box,
  Typography
} from '@mui/material';

const ResponsiveTable = ({ columns, data, stackOnMobile = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile && stackOnMobile) {
    // Card-based layout for mobile
    return (
      <Box sx={{ width: '100%' }}>
        {data.map((row, rowIndex) => (
          <Paper
            key={rowIndex}
            elevation={2}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              '&:last-child': { mb: 0 }
            }}
          >
            {columns.map((column, colIndex) => (
              <Box
                key={colIndex}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: colIndex < columns.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}
                >
                  {column.label}:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    textAlign: 'right',
                    ml: 2
                  }}
                >
                  {typeof column.render === 'function'
                    ? column.render(row[column.field], row)
                    : row[column.field]}
                </Typography>
              </Box>
            ))}
          </Paper>
        ))}
      </Box>
    );
  }

  // Standard table layout for desktop
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
            {columns.map((column, index) => (
              <TableCell
                key={index}
                align={column.align || 'left'}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  py: 2
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: 'rgba(0,0,0,0.01)'
                },
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.03)'
                }
              }}
            >
              {columns.map((column, colIndex) => (
                <TableCell
                  key={colIndex}
                  align={column.align || 'left'}
                  sx={{ fontSize: '0.875rem', py: 1.5 }}
                >
                  {typeof column.render === 'function'
                    ? column.render(row[column.field], row)
                    : row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

ResponsiveTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  stackOnMobile: PropTypes.bool
};

export default ResponsiveTable;
