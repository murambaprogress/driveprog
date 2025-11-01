import { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import Card from '@mui/material/Card';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';

ChartJS.register(ArcElement, Tooltip, Legend);

function ReportsPieChart({ color, title, description, date, data: pieData }) {
  const chartRef = useRef(null);
  const chartData = useMemo(() => pieData, [pieData]);

  // compute KPI values
  const values = (chartData?.datasets?.[0]?.data) || [];
  const total = values.reduce((s, v) => s + (Number(v) || 0), 0);
  const avg = values.length ? Math.round(total / values.length) : 0;

  return (
    <Card sx={{ height: '100%' }}>
      <MDBox padding="1rem">
        {/* KPI overlay */}
        <MDBox sx={{ position: 'absolute', right: 20, top: 16, background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
          <MDTypography variant="caption">Total</MDTypography>
          <MDTypography variant="h6">{total}</MDTypography>
          <MDTypography variant="caption">Avg: {avg}</MDTypography>
        </MDBox>
        {useMemo(
          () => (
            <MDBox py={2} height="12.5rem">
              <Pie
                ref={chartRef}
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function (ctx) {
                          const v = ctx.raw || 0;
                          const pct = total ? ((v / total) * 100).toFixed(1) : 0;
                          return `${ctx.label || ''}: ${v} (${pct}%)`;
                        }
                      }
                    },
                    legend: {
                      display: true,
                      position: 'bottom',
                      onClick: (e, legendItem, legend) => {
                        // toggle visibility of slice
                        const index = legendItem.index;
                        const chart = legend.chart;
                        const meta = chart.getDatasetMeta(0);
                        meta.data[index].hidden = !meta.data[index].hidden;
                        chart.update();
                      }
                    }
                  }
                }}
              />
            </MDBox>
          ),
          [chartData]
        )}
        <MDBox pt={3} pb={1} px={1}>
          <MDTypography variant="h6" textTransform="capitalize">
            {title}
          </MDTypography>
          <MDTypography component="div" variant="button" color="text" fontWeight="light">
            {description}
          </MDTypography>
          <MDBox display="flex" alignItems="center">
            <MDTypography variant="button" color="text" fontWeight="light">
              {date}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

ReportsPieChart.defaultProps = { color: 'info', description: '' };
ReportsPieChart.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export default ReportsPieChart;
