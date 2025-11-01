// Compatibility re-export: some routes import "layouts/paymentHistory"
// but the payment history component lives under layouts/loan/history.js
import PaymentHistory from "../loan/history";

export default PaymentHistory;
