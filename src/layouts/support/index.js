import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
// import FormControl from "@mui/material/FormControl"; // Replaced with VhoozhtSelect
// import InputLabel from "@mui/material/InputLabel"; // Replaced with VhoozhtSelect labels
// import Select from "@mui/material/Select"; // Replaced with VhoozhtSelect
// import MenuItem from "@mui/material/MenuItem"; // Replaced with VhoozhtSelect options
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
// DriveCash unified form components
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import { formatters } from "utils/dataFormatters";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { supportTickets } from "./data/supportTickets";

// Mock data for DriveCash Support
const supportData = {
  contactInfo: {
  phone: "1-800-DRIVECASH (1-800-374-3222)",
  email: "support@drivecash.com",
    hours: "Monday - Friday: 7:00 AM - 8:00 PM EST\nSaturday: 9:00 AM - 5:00 PM EST\nSunday: 10:00 AM - 4:00 PM EST",
    emergencyHours: "24/7 for payment emergencies"
  },
  faq: [
    {
      category: "Title Loan Basics",
      questions: [
        {
          question: "What is a title loan?",
          answer: "A title loan is a fast and convenient way to access cash using your car as collateral. As long as you own your vehicle and have a lien-free title, you can use it to borrow money you need. With DriveCash, you keep driving your car while repaying the loan."
        },
        {
          question: "Does my car/vehicle have to be paid off for a loan?",
          answer: "Yes, your vehicle must be paid off completely to qualify for a title loan. You need to have a clear, lien-free title in your name. If you still owe money on your car, consider our refinancing options or wait until the loan is paid off."
        },
        {
          question: "How much cash can I get with a loan?",
          answer: "With DriveCash, you can borrow up to $25,000 or 50% of your vehicle's current market value, whichever is lower. The exact amount depends on your vehicle's year, make, model, mileage, and overall condition. Use our online calculator for an instant estimate."
        },
        {
          question: "Why choose a title lender for funds?",
          answer: "Title loans offer several advantages: fast approval (often within minutes), no credit check requirements, keep driving your vehicle, flexible repayment terms, and same-day funding available. Unlike traditional banks, we focus on your vehicle's value rather than your credit score."
        },
        {
          question: "What do I need for a loan?",
          answer: "You'll need: a clear vehicle title in your name, valid government-issued photo ID, proof of income, proof of residence, vehicle registration, and current auto insurance. Our online application makes the process simple and secure."
        }
      ]
    },
    {
      category: "Title & Ownership",
      questions: [
        {
          question: "Does the title have to be in my name?",
          answer: "Yes, the vehicle title must be in your name to qualify for a title loan. If the title is in someone else's name, they would need to apply for the loan. Joint titles with a spouse are acceptable, but both parties may need to sign the loan agreement."
        },
        {
          question: "How do I get my title back?",
          answer: "Once you pay off your loan in full, DriveCash will release the lien and return your title within 10 business days. In electronic title states, we'll process the lien release digitally with your state's DMV. You'll receive confirmation when the process is complete."
        }
      ]
    },
    {
      category: "Employment & Income",
      questions: [
        {
          question: "Can I get a car title loan if I am on disability, social security or collecting unemployment?",
          answer: "Yes! DriveCash accepts various forms of income including Social Security, disability payments, unemployment benefits, pension payments, and other government assistance. As long as you have a regular monthly income of at least $1,000, you may qualify."
        },
        {
          question: "Can I get a car title loan if I am self-employed?",
          answer: "Absolutely! Self-employed applicants are welcome at DriveCash. You'll need to provide bank statements showing regular deposits, tax returns, or other documentation of your income. We understand self-employed income can vary and work with you accordingly."
        },
        {
          question: "Do I have to have a job to get a car title loan?",
          answer: "You don't need a traditional job, but you do need verifiable monthly income of at least $1,000. This can include employment wages, self-employment income, Social Security, disability, pension, unemployment benefits, or other regular income sources."
        }
      ]
    },
    {
      category: "Insurance & Credit",
      questions: [
        {
          question: "Do I have to have insurance to get a loan?",
          answer: "Yes, you must maintain full coverage auto insurance on your vehicle throughout the loan term. This protects both you and DriveCash in case of an accident. We can help you find competitive insurance rates through our partner network if needed."
        },
        {
          question: "What if I have bad credit?",
          answer: "Bad credit is not a problem with DriveCash! We don't perform traditional credit checks because our loans are secured by your vehicle's value. Whether you have poor credit, no credit, or past bankruptcies, you can still qualify based on your vehicle's equity and income."
        }
      ]
    },
    {
      category: "Payment Issues",
      questions: [
        {
          question: "What if I can't make a payment?",
          answer: "If you're facing financial hardship, contact DriveCash immediately. We understand that life happens and we're here to help. We offer payment deferrals, extended payment plans, and loan modification options. The key is to communicate with us before you miss a payment so we can work together on a solution."
        },
        {
          question: "How do I make a payment?",
          answer: "You can make payments through your DriveCash online account, mobile app, by phone at 1-800-DRIVECASH, or by setting up automatic payments. We accept bank transfers (free), debit cards, and credit cards (fees may apply). Payments are processed the same business day when made before 5 PM EST."
        },
        {
          question: "What happens if I miss a payment?",
          answer: "If you miss a payment, contact us immediately at 1-800-DRIVECASH. We offer a grace period and work with customers facing temporary hardships. However, missing payments can result in late fees and may affect your credit. We're committed to finding solutions before repossession becomes necessary."
        },
        {
          question: "Can I change my payment due date?",
          answer: "Yes, you can request to change your payment due date once per year through your online account or by calling customer service. The change will take effect with your next payment cycle and must align with your income schedule."
        }
      ]
    },
        {
          category: "Application Process",
          questions: [
            {
              question: "How long does the loan approval process take?",
              answer: "DriveCash offers some of the fastest approvals in the industry. Most applications receive approval within 30 minutes to 2 hours during business hours. Once approved, you can receive funds as quickly as the same day or within 24-48 hours maximum."
            },
        {
          question: "Is there a penalty for paying off my loan early?",
          answer: "No, DriveCash never charges prepayment penalties! You can pay off your loan early at any time and save on interest charges. Contact us for a current payoff quote, which is valid for 10 business days. Early payoff is one of the many benefits of choosing DriveCash."
        },
        {
          question: "Can I refinance my existing title loan with DriveCash?",
          answer: "Yes! DriveCash offers title loan refinancing and buyouts. If you have an existing title loan with another lender, we may be able to offer you better rates, lower payments, or additional cash. Our refinancing process is quick and can often save you money each month."
        }
      ]
    }
  ],
  quickActions: [
    {
      title: "Make a Payment",
      description: "Pay your loan instantly online",
      icon: "payment",
      color: "success",
      action: "payment"
    },
    {
      title: "Get Payoff Quote",
      description: "Request current payoff amount",
      icon: "receipt_long",
      color: "info",
      action: "payoff"
    },
    {
      title: "Update Contact Info",
      description: "Change address, phone, or email",
      icon: "edit",
      color: "warning",
      action: "contact"
    },
    {
      title: "Download Documents",
      description: "Access loan statements and contracts",
      icon: "download",
      color: "primary",
      action: "documents"
    },
    {
      title: "Request Loan Modification",
      description: "Apply for payment assistance",
      icon: "support",
      color: "error",
      action: "modification"
    },
    {
      title: "Report Lost Title",
      description: "Request duplicate title",
      icon: "description",
      color: "dark",
      action: "title"
    }
  ],
  knowledgeBase: [
    {
  title: "Getting Started with DriveCash",
      articles: [
        "Setting up your online account",
        "Understanding your loan terms",
        "Navigation guide to your dashboard",
        "Setting up mobile app notifications"
      ]
    },
    {
      title: "Payment Management",
      articles: [
        "Payment options and methods",
        "Setting up AutoPay for rate discount",
        "Understanding payment allocation",
        "Temporary payment assistance programs"
      ]
    },
    {
      title: "Vehicle Financing",
      articles: [
        "Choosing between new vs. used vehicle financing",
        "Understanding extended warranties",
        "Gap insurance explained",
        "Vehicle inspection requirements"
      ]
    },
    {
      title: "Account Security",
      articles: [
        "Protecting your account information",
        "Security and privacy settings",
        "Recognizing phishing attempts",
        "What to do if your account is compromised"
      ]
    }
  ]
};

function Support() {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "info" });
  const [chatDialog, setChatDialog] = useState(false);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [contactDialog, setContactDialog] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: ""
  });

  const showSnackbar = (message, color = "success") => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => setSnackbar({ open: false, message: "", color: "info" }), 3000);
  };

  const handleFaqExpand = (panel) => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "payment":
        showSnackbar("Redirecting to payment portal...", "info");
        break;
      case "payoff":
        showSnackbar("Generating payoff quote...", "info");
        break;
      case "contact":
        setContactDialog(true);
        break;
      case "documents":
        showSnackbar("Opening document center...", "info");
        break;
      case "modification":
        showSnackbar("Opening loan modification request...", "warning");
        break;
      case "title":
        showSnackbar("Opening title request form...", "info");
        break;
      default:
        showSnackbar("Feature coming soon!", "info");
    }
  };

  const handleTicketSubmit = () => {
    if (!newTicket.subject || !newTicket.category || !newTicket.description) {
      showSnackbar("Please fill in all required fields", "error");
      return;
    }
    
    setTicketDialog(false);
    setNewTicket({ subject: "", category: "", priority: "medium", description: "" });
    showSnackbar("Support ticket created successfully! Ticket #TCK-2025-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'), "success");
  };

  const startChat = () => {
    setChatDialog(true);
    // Simulate chat connection
    setTimeout(() => {
  showSnackbar("Connected to Sarah from DriveCash Support!", "success");
    }, 1000);
  };

  const filteredFaq = supportData.faq.filter(category => 
    selectedCategory === "all" || category.category.toLowerCase().includes(selectedCategory.toLowerCase())
  ).map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      searchTerm === "" || 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Header */}
        <MDBox mb={4}>
          <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
            DriveCash Support Center
          </MDTypography>
          <MDTypography variant="h6" color="text">
            We're here to help you every step of the way
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          {/* Contact Information Card */}
          <Grid item xs={12} lg={4}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <Icon sx={{ color: "#16a085", fontSize: 24, mr: 1 }}>support_agent</Icon>
                  <MDTypography variant="h5" fontWeight="bold">
                    Contact Us
                  </MDTypography>
                </MDBox>
                
                <MDBox mb={3}>
                  <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                    Phone Support
                  </MDTypography>
                  <MDTypography variant="body1" color="info" mb={1}>
                    {supportData.contactInfo.phone}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    {supportData.contactInfo.hours}
                  </MDTypography>
                </MDBox>

                <MDBox mb={3}>
                  <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                    Email Support
                  </MDTypography>
                  <MDTypography variant="body1" color="info">
                    {supportData.contactInfo.email}
                  </MDTypography>
                </MDBox>

                <MDBox mb={3}>
                  <MDTypography variant="body2" fontWeight="medium" color="dark" mb={1}>
                    Emergency Line
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    {supportData.contactInfo.emergencyHours}
                  </MDTypography>
                </MDBox>

                <MDBox display="flex" flexDirection="column" gap={2}>
                  <MDButton 
                    variant="gradient" 
                    color="info" 
                    onClick={() => showSnackbar("Live Chat coming soon!", "info")}
                    startIcon={<Icon>chat</Icon>} >
                    Start Live Chat
                  </MDButton>
                  <MDButton color="dark"
                    onClick={() => showSnackbar("Support Tickets coming soon!", "info")}
                    startIcon={<Icon>add</Icon>} >
                    Create Support Ticket
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="bold" mb={3}>
                  Quick Actions
                </MDTypography>
                <Grid container spacing={2}>
                  {supportData.quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => handleQuickAction(action.action)}
                      >
                        <MDBox p={2} textAlign="center">
                          <Icon 
                            sx={{ 
                              fontSize: 32, 
                              color: action.color === 'primary' ? '#1976d2' :
                                     action.color === 'success' ? '#16a085' :
                                     action.color === 'info' ? '#2196f3' :
                                     action.color === 'warning' ? '#ff9800' :
                                     action.color === 'error' ? '#f44336' : '#666',
                              mb: 1 
                            }}
                          >
                            {action.icon}
                          </Icon>
                          <MDTypography variant="h6" fontWeight="medium" mb={1}>
                            {action.title}
                          </MDTypography>
                          <MDTypography variant="body2" color="text">
                            {action.description}
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          {/* FAQ Section */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <MDTypography variant="h5" fontWeight="bold">
                    Frequently Asked Questions
                  </MDTypography>
                  <MDBox display="flex" gap={2}>
                    <VhoozhtInput
                      placeholder="Search FAQs..."
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ minWidth: 200 }}
                    />
                    <VhoozhtSelect
                      size="small"
                      label="Category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      sx={{ minWidth: 150 }}
                      options={[
                        { value: 'all', label: 'All Categories' },
                        { value: 'loan', label: 'Loan Application' },
                        { value: 'payment', label: 'Payments & Account' },
                        { value: 'vehicle', label: 'Vehicle & Insurance' },
                        { value: 'refinancing', label: 'Refinancing' }
                      ]}
                    />
                  </MDBox>
                </MDBox>

                {filteredFaq.map((category, categoryIndex) => (
                  <MDBox key={categoryIndex} mb={3}>
                    <MDTypography variant="h6" fontWeight="bold" color="info" mb={2}>
                      {category.category}
                    </MDTypography>
                    {category.questions.map((faq, faqIndex) => (
                      <Accordion 
                        key={`${categoryIndex}-${faqIndex}`}
                        expanded={expandedFaq === `${categoryIndex}-${faqIndex}`}
                        onChange={handleFaqExpand(`${categoryIndex}-${faqIndex}`)}
                        sx={{ mb: 1 }}
                      >
                        <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                          <MDTypography variant="body1" fontWeight="medium">
                            {faq.question}
                          </MDTypography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <MDTypography variant="body2" color="text">
                            {faq.answer}
                          </MDTypography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </MDBox>
                ))}
              </MDBox>
            </Card>
          </Grid>

          {/* Knowledge Base & Support Tickets */}
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="bold" mb={3}>
                  Knowledge Base
                </MDTypography>
                {supportData.knowledgeBase.map((section, index) => (
                  <MDBox key={index} mb={3}>
                    <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
                      {section.title}
                    </MDTypography>
                    {section.articles.map((article, articleIndex) => (
                      <MDBox 
                        key={articleIndex} 
                        display="flex" 
                        alignItems="center" 
                        mb={1}
                        sx={{ cursor: 'pointer', '&:hover': { color: '#16a085' } }}
                        onClick={() => showSnackbar(`Opening: ${article}`, "info")}
                      >
                        <Icon sx={{ fontSize: 18, mr: 1, color: '#666' }}>article</Icon>
                        <MDTypography variant="body2" color="text">
                          {article}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                ))}
              </MDBox>
            </Card>
          </Grid>

          {/* Recent Support Tickets */}
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <MDTypography variant="h5" fontWeight="bold">
                    Recent Support Tickets
                  </MDTypography>
                  <MDButton 
                    size="small" 
                    variant="text" 
                    color="info"
                    onClick={() => showSnackbar("Opening all tickets...", "info")}
                  >
                    View All
                  </MDButton>
                </MDBox>
                {supportTickets.slice(0, 3).map((ticket, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <MDBox p={2}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <MDTypography variant="body1" fontWeight="medium">
                          {ticket.subject}
                        </MDTypography>
                        <Chip 
                          label={ticket.status} 
                          size="small"
                          color={ticket.status === "Open" ? "warning" : "success"}
                        />
                      </MDBox>
                      <MDTypography variant="caption" color="text" mb={1}>
                                Ticket #{ticket.id}
                              </MDTypography>
                              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                                <MDTypography variant="caption" color="text">
                                  Created: {formatters.date(ticket.createdAt)}
                                </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {ticket.messages.length} messages
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Card>
                ))}
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Chat Dialog */}
        <Dialog open={chatDialog} onClose={() => setChatDialog(false)} maxWidth="sm" >
          <DialogTitle>Live Chat with DriveCash Support</DialogTitle>
          <DialogContent>
            <MDBox p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', mb: 2 }}>
              <MDTypography variant="body2" fontWeight="medium" color="success" mb={1}>
                Sarah - Support Agent
              </MDTypography>
              <MDTypography variant="body2">
                Hi! I'm Sarah from DriveCash Support. How can I help you today?
              </MDTypography>
              <MDTypography variant="caption" color="text">
                {formatters.datetime(new Date())}
              </MDTypography>
            </MDBox>
            <VhoozhtInput
              placeholder="Type your message..." multiline
              rows={3} sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setChatDialog(false)} color="dark">
              Close Chat
            </MDButton>
            <MDButton variant="gradient" color="info">
              Send Message
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Create Ticket Dialog */}
        <Dialog open={ticketDialog} onClose={() => setTicketDialog(false)} maxWidth="md" >
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <VhoozhtInput
                  label="Subject"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <VhoozhtSelect
                  required
                  label="Category"
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  options={[
                    { value: 'payment', label: 'Payment Issues' },
                    { value: 'account', label: 'Account Access' },
                    { value: 'application', label: 'Loan Application' },
                    { value: 'documents', label: 'Document Upload' },
                    { value: 'technical', label: 'Technical Support' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <VhoozhtSelect
                  label="Priority"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' }
                  ]}
                />
              </Grid>
              <Grid item xs={12}>
                <VhoozhtInput
                  label="Description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} multiline
                  rows={4}
                  required
                  placeholder="Please describe your issue in detail..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setTicketDialog(false)} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleTicketSubmit} variant="gradient" color="info">
              Create Ticket
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Update Contact Dialog */}
        <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" >
          <DialogTitle>Update Contact Information</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <VhoozhtInput label="Full Name" defaultValue="John Doe" />
              </Grid>
              <Grid item xs={12}>
                <VhoozhtInput label="Email Address" defaultValue="john.doe@email.com" />
              </Grid>
              <Grid item xs={12}>
                <VhoozhtInput label="Phone Number" defaultValue="(555) 123-4567" />
              </Grid>
              <Grid item xs={12}>
                <VhoozhtInput label="Address" defaultValue="123 Main Street" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <VhoozhtInput label="City" defaultValue="Anytown" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <VhoozhtInput label="ZIP Code" defaultValue="12345" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setContactDialog(false)} color="dark">
              Cancel
            </MDButton>
            <MDButton 
              onClick={() => {
                setContactDialog(false);
                showSnackbar("Contact information updated successfully!", "success");
              }} 
              variant="gradient" 
              color="info"
            >
              Update Information
            </MDButton>
          </DialogActions>
        </Dialog>

        <Footer />
        <MDSnackbar
          color={snackbar.color}
          icon={<Icon>notifications</Icon>}
          title="Notification"
          content={snackbar.message}
          dateTime={formatters.datetime(new Date())}
          open={snackbar.open}
          close={() => setSnackbar({ open: false, message: "", color: "info" })}
        />
      </MDBox>
    </DashboardLayout>
  );
}

export default Support;
