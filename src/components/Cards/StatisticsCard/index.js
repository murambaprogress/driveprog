import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function StatisticsCard({ color, icon, title, count, percentage, description }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box p={2} flexGrow={1}>
        <Grid container alignItems="center" sx={{ height: "100%" }}>
          <Grid item>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: `${color}.main`,
                color: 'white',
                width: '4rem',
                height: '4rem',
                boxShadow: 3,
                borderRadius: 2,
                marginRight: 2,
              }}
            >
              <Icon fontSize="medium">{icon}</Icon>
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="button" color="textSecondary" fontWeight="light" sx={{ textTransform: 'capitalize' }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {count}
            </Typography>
          </Grid>
        </Grid>
        <Box mt={2} pt={1} borderTop={1} borderColor="grey.300">
          <Typography variant="body2" color="text.secondary">
            <Typography
              component="span"
              variant="body2"
              fontWeight="bold"
              color={percentage.color === 'success' ? 'success.main' : 'error.main'}
            >
              {percentage.label}
            </Typography>
            &nbsp;{description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

StatisticsCard.defaultProps = {
  color: "info",
  percentage: {
    color: "success",
    label: "",
  },
  description: "",
};

StatisticsCard.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf(["success", "error"]),
    label: PropTypes.string,
  }),
  description: PropTypes.string,
};

export default StatisticsCard;
