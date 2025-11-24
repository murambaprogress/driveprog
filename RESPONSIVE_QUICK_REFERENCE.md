# Quick Reference: Responsive Design

## Breakpoints
| Size | From | To | Device |
|------|------|-----|--------|
| xs | 0px | 575px | Mobile Portrait |
| sm | 576px | 767px | Mobile Landscape |
| md | 768px | 991px | Tablets |
| lg | 992px | 1199px | Laptops |
| xl | 1200px | 1399px | Desktops |
| xxl | 1400px | ∞ | Large Screens |

## Common Patterns

### Responsive Padding
```jsx
sx={{ p: { xs: 2, sm: 3, md: 4 } }}
```

### Responsive Font Size
```jsx
sx={{ fontSize: { xs: '14px', md: '16px' } }}
```

### Hide/Show by Screen Size
```jsx
// Hide on mobile
sx={{ display: { xs: 'none', md: 'block' } }}

// Show only on mobile
sx={{ display: { xs: 'block', md: 'none' } }}
```

### Responsive Grid
```jsx
<Grid item xs={12} sm={6} md={4} lg={3}>
  Content
</Grid>
```

## New Components

### ResponsiveTable
```jsx
import { ResponsiveTable } from 'components/responsive';

<ResponsiveTable 
  columns={columns} 
  data={data} 
  stackOnMobile={true} 
/>
```

### ResponsiveGrid
```jsx
import { ResponsiveGrid } from 'components/responsive';

<ResponsiveGrid xs={12} sm={6} md={4}>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</ResponsiveGrid>
```

### ResponsiveContainer
```jsx
import { ResponsiveContainer } from 'components/responsive';

<ResponsiveContainer maxWidth="lg">
  <Content />
</ResponsiveContainer>
```

## CSS Utility Classes

| Class | Purpose |
|-------|---------|
| `.responsive-container` | Max-width container |
| `.responsive-table-wrapper` | Scrollable tables |
| `.stack-table` | Card-style mobile tables |
| `.mobile-hide` | Hide on mobile |
| `.mobile-compact` | Reduced mobile padding |
| `.button-group-mobile` | Vertical mobile buttons |

## Media Queries Hook

```jsx
import { useMediaQuery, useTheme } from '@mui/material';

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
```

## Best Practices

1. ✅ Mobile-first approach
2. ✅ Touch targets ≥ 44px
3. ✅ Font size ≥ 16px on mobile
4. ✅ Test on real devices
5. ✅ Optimize images
6. ✅ Avoid horizontal scrolling
7. ✅ Use semantic HTML
8. ✅ Add ARIA labels

## Testing

- Chrome DevTools: F12 → Toggle Device Toolbar
- Firefox: F12 → Responsive Design Mode
- Safari: Develop → Enter Responsive Design Mode

## Quick Fixes

### Text Too Small on Mobile
```jsx
sx={{ fontSize: { xs: '16px', md: '14px' } }}
```

### Buttons Too Close
```jsx
sx={{ gap: { xs: 2, md: 1 } }}
```

### Table Overflow
```jsx
<Box sx={{ overflowX: 'auto' }}>
  <Table />
</Box>
```

### Form Too Wide
```jsx
<Box sx={{ maxWidth: { xs: '100%', md: '600px' } }}>
  <Form />
</Box>
```
