/**
 * 24/7 Chat Platform - User Communication with Admin Team
 * Real-time messaging with admin support
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
// import TextField from "@mui/material/TextField"; // Replaced with VhoozhtTextarea
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { VhoozhtInput, VhoozhtSelect, VhoozhtTextarea } from "components/VhoozhtForms";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import formatters from "utils/dataFormatters";

// Chat Message Component
function ChatMessage({ message, isOwnMessage, timestamp, status, senderName, senderAvatar }) {
  const formatTime = (date) => formatters.time(date, { hour: '2-digit', minute: '2-digit' });

  return (
    <MDBox
      display="flex"
      justifyContent={isOwnMessage ? "flex-end" : "flex-start"}
      mb={2}
    >
      <MDBox
        display="flex"
        alignItems="flex-end"
        maxWidth="70%"
        flexDirection={isOwnMessage ? "row-reverse" : "row"}
      >
        {!isOwnMessage && (
          <Avatar
            src={senderAvatar}
            sx={{
              width: 32,
              height: 32,
              mr: 1,
              bgcolor: '#2196f3'
            }}
          >
            {senderName?.charAt(0)}
          </Avatar>
        )}
        
        <MDBox>
          {!isOwnMessage && (
            <MDTypography variant="caption" color="text" opacity={0.7} ml={1}>
              {senderName}
            </MDTypography>
          )}
          
          <Card
            sx={{
              p: 2,
              bgcolor: isOwnMessage ? '#2196f3' : '#f5f5f5',
              color: isOwnMessage ? 'white' : 'inherit',
              borderRadius: '18px',
              borderTopRightRadius: isOwnMessage ? '6px' : '18px',
              borderTopLeftRadius: isOwnMessage ? '18px' : '6px',
              boxShadow: 1,
            }}
          >
            <MDTypography
              variant="body2"
              color={isOwnMessage ? "white" : "text"}
              sx={{ wordBreak: 'break-word' }}
            >
              {message}
            </MDTypography>
          </Card>
          
          <MDBox
            display="flex"
            justifyContent={isOwnMessage ? "flex-end" : "flex-start"}
            alignItems="center"
            mt={0.5}
            gap={1}
          >
            <MDTypography variant="caption" color="text" opacity={0.6}>
              {formatTime(timestamp)}
            </MDTypography>
            {isOwnMessage && status && (
              <Icon
                fontSize="small"
                sx={{
                  color: status === 'sent' ? '#9e9e9e' : 
                         status === 'delivered' ? '#2196f3' : 
                         status === 'read' ? '#4caf50' : '#9e9e9e',
                  fontSize: 16
                }}
              >
                {status === 'sent' ? 'check' : 
                 status === 'delivered' ? 'done_all' : 
                 status === 'read' ? 'done_all' : 'schedule'}
              </Icon>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Chat Header Component
function ChatHeader({ adminOnline, lastSeen, onMenuClick }) {
  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <MDBox display="flex" alignItems="center" justifyContent="space-between">
        <MDBox display="flex" alignItems="center">
          <Badge
            badgeContent=""
            color={adminOnline ? "success" : "error"}
            variant="dot"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#2196f3',
                width: 48,
                height: 48,
                mr: 2,
              }}
            >
              <Icon>support_agent</Icon>
            </Avatar>
          </Badge>
          
          <MDBox>
            <MDTypography variant="h6" fontWeight="bold">
              Admin Support Team
            </MDTypography>
            <MDTypography variant="caption" color="text" opacity={0.7}>
              {adminOnline ? (
                <>
                  <Icon fontSize="small" sx={{ color: '#4caf50', mr: 0.5, verticalAlign: 'middle' }}>
                    circle
                  </Icon>
                  Online • Typically replies within minutes
                </>
              ) : (
                <>
                  <Icon fontSize="small" sx={{ color: '#9e9e9e', mr: 0.5, verticalAlign: 'middle' }}>
                    circle
                  </Icon>
                  Last seen {lastSeen}
                </>
              )}
            </MDTypography>
          </MDBox>
        </MDBox>
        
        <IconButton onClick={onMenuClick}>
          <Icon>more_vert</Icon>
        </IconButton>
      </MDBox>
    </Card>
  );
}

// Quick Actions Component
function QuickActions({ onQuickMessage }) {
  const quickMessages = [
    "I need help with my loan application",
    "Question about my payment",
    "Document upload issue",
    "Account verification help",
    "Technical support needed"
  ];

  return (
    <MDBox mb={2}>
      <MDTypography variant="body2" color="text" opacity={0.8} mb={1}>
        Quick actions:
      </MDTypography>
      <MDBox display="flex" gap={1} flexWrap="wrap">
        {quickMessages.map((message, index) => (
          <Chip
            key={index}
            label={message}
            variant="outlined"
            clickable
            onClick={() => onQuickMessage(message)}
            sx={{
              fontSize: '0.75rem',
              '&:hover': {
                bgcolor: alpha('#2196f3', 0.1),
                borderColor: '#2196f3'
              }
            }}
          />
        ))}
      </MDBox>
    </MDBox>
  );
}

function ChatPlatform() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hello! Welcome to our 24/7 support. How can I help you today?",
      timestamp: new Date(Date.now() - 300000),
      isOwnMessage: false,
      senderName: "Admin Sarah",
      senderAvatar: null,
      status: 'delivered'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState("2 minutes ago");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [supportDialog, setSupportDialog] = useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate admin responses
  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].isOwnMessage) {
      setIsTyping(true);
      
      const responses = [
        "Thank you for contacting us. I'll help you with that right away.",
        "I understand your concern. Let me check your account details.",
        "That's a great question. Here's what I can tell you...",
        "I've reviewed your case. Here are the next steps...",
        "Is there anything else I can help you with today?",
      ];
      
      setTimeout(() => {
        setIsTyping(false);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          message: randomResponse,
          timestamp: new Date(),
          isOwnMessage: false,
          senderName: "Admin Sarah",
          senderAvatar: null,
          status: 'delivered'
        }]);
        
        // Mark user messages as read
        setMessages(prev => prev.map(msg => 
          msg.isOwnMessage ? { ...msg, status: 'read' } : msg
        ));
      }, 2000 + Math.random() * 2000);
    }
  }, [messages.length, messages]);

  // Simulate online status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setAdminOnline(prev => Math.random() > 0.2); // 80% chance online
      if (!adminOnline) {
        setLastSeen(`${Math.floor(Math.random() * 30)} minutes ago`);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [adminOnline]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      message: newMessage,
      timestamp: new Date(),
      isOwnMessage: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);
  };

  const handleQuickMessage = (message) => {
    setNewMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={4}>
          <MDTypography variant="h4" fontWeight="bold" color="text" mb={1}>
            24/7 Chat Support 💬
          </MDTypography>
          <MDTypography variant="body1" color="text" opacity={0.7}>
            Get instant help from our support team anytime, anywhere.
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          {/* Main Chat Area */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Header */}
              <ChatHeader
                adminOnline={adminOnline}
                lastSeen={lastSeen}
                onMenuClick={(e) => setMenuAnchor(e.currentTarget)}
              />

              {/* Messages Area */}
              <MDBox
                flex={1}
                sx={{
                  overflowY: 'auto',
                  px: 2,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '3px',
                  },
                }}
              >
                {messages.map((message) => (
                  <ChatMessage key={message.id} {...message} />
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#2196f3' }}>
                      A
                    </Avatar>
                    <Card
                      sx={{
                        p: 2,
                        bgcolor: '#f5f5f5',
                        borderRadius: '18px',
                        borderTopLeftRadius: '6px',
                      }}
                    >
                      <MDBox display="flex" gap={0.5}>
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: '#9e9e9e',
                              animation: 'typing 1.4s infinite',
                              animationDelay: `${i * 0.2}s`,
                              '@keyframes typing': {
                                '0%, 60%, 100%': {
                                  transform: 'translateY(0)',
                                },
                                '30%': {
                                  transform: 'translateY(-10px)',
                                }
                              }
                            }}
                          />
                        ))}
                      </MDBox>
                    </Card>
                  </MDBox>
                )}
                
                <div ref={messagesEndRef} />
              </MDBox>

              <Divider />

              {/* Message Input */}
              <MDBox p={2}>
                <MDBox display="flex" alignItems="flex-end" gap={2}>
                  <VhoozhtTextarea
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="small"
                  />
                  
                  <Tooltip title="Send Message">
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      sx={{
                        minWidth: 'auto',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        p: 0
                      }}
                    >
                      <Icon>send</Icon>
                    </MDButton>
                  </Tooltip>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <MDBox display="flex" flexDirection="column" gap={3}>
              {/* Quick Actions */}
              <Card sx={{ p: 3 }}>
                <MDTypography variant="h6" fontWeight="bold" mb={2}>
                  Quick Actions
                </MDTypography>
                <QuickActions onQuickMessage={handleQuickMessage} />
              </Card>

              {/* Support Information */}
              <Card sx={{ p: 3 }}>
                <MDTypography variant="h6" fontWeight="bold" mb={2}>
                  Support Information
                </MDTypography>
                
                <MDBox display="flex" alignItems="center" mb={2}>
                  <Icon sx={{ color: '#4caf50', mr: 1 }}>schedule</Icon>
                  <MDBox>
                    <MDTypography variant="body2" fontWeight="medium">
                      Available 24/7
                    </MDTypography>
                    <MDTypography variant="caption" color="text" opacity={0.7}>
                      Round-the-clock support
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDBox display="flex" alignItems="center" mb={2}>
                  <Icon sx={{ color: '#2196f3', mr: 1 }}>flash_on</Icon>
                  <MDBox>
                    <MDTypography variant="body2" fontWeight="medium">
                      Average Response Time
                    </MDTypography>
                    <MDTypography variant="caption" color="text" opacity={0.7}>
                      Less than 2 minutes
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDBox display="flex" alignItems="center" mb={3}>
                  <Icon sx={{ color: '#ff9800', mr: 1 }}>star</Icon>
                  <MDBox>
                    <MDTypography variant="body2" fontWeight="medium">
                      Customer Satisfaction
                    </MDTypography>
                    <MDTypography variant="caption" color="text" opacity={0.7}>
                      4.9/5.0 rating
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDButton
                  variant="outlined"
                  color="info"
                  fullWidth
                  onClick={() => setSupportDialog(true)}
                  startIcon={<Icon>help</Icon>}
                >
                  Support Center
                </MDButton>
              </Card>

              {/* Recent Topics */}
              <Card sx={{ p: 3 }}>
                <MDTypography variant="h6" fontWeight="bold" mb={2}>
                  Popular Topics
                </MDTypography>
                
                {[
                  { title: "Loan Application Status", icon: "account_balance", count: "152 discussions" },
                  { title: "Payment Processing", icon: "payment", count: "89 discussions" },
                  { title: "Document Verification", icon: "verified", count: "67 discussions" },
                  { title: "Account Settings", icon: "settings", count: "45 discussions" },
                ].map((topic, index) => (
                  <MDBox
                    key={index}
                    display="flex"
                    alignItems="center"
                    py={1.5}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: alpha('#2196f3', 0.05)
                      }
                    }}
                    onClick={() => handleQuickMessage(`I need help with ${topic.title.toLowerCase()}`)}
                  >
                    <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: '#2196f3' }}>
                      <Icon fontSize="small">{topic.icon}</Icon>
                    </Avatar>
                    <MDBox flex={1}>
                      <MDTypography variant="body2" fontWeight="medium">
                        {topic.title}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" opacity={0.7}>
                        {topic.count}
                      </MDTypography>
                    </MDBox>
                    <Icon color="action" fontSize="small">chevron_right</Icon>
                  </MDBox>
                ))}
              </Card>
            </MDBox>
          </Grid>
        </Grid>

        {/* Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => { setMenuAnchor(null); setSupportDialog(true); }}>
            <Icon sx={{ mr: 1 }}>help</Icon>
            Support Center
          </MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>
            <Icon sx={{ mr: 1 }}>history</Icon>
            Chat History
          </MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>
            <Icon sx={{ mr: 1 }}>clear</Icon>
            Clear Chat
          </MenuItem>
        </Menu>

        {/* Support Dialog */}
        <Dialog
          open={supportDialog}
          onClose={() => setSupportDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <MDBox display="flex" alignItems="center">
              <Icon sx={{ mr: 1 }}>help</Icon>
              Support Center
            </MDBox>
          </DialogTitle>
          <DialogContent>
            <MDTypography variant="body2" mb={2}>
              Our support team is here to help you with any questions or issues you may have.
            </MDTypography>
            
            <MDBox display="flex" flexDirection="column" gap={2}>
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ color: '#2196f3', mr: 2 }}>email</Icon>
                <MDBox>
                  <MDTypography variant="body2" fontWeight="medium">Email Support</MDTypography>
                  <MDTypography variant="caption" color="text">support@drivecash.com</MDTypography>
                </MDBox>
              </MDBox>
              
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ color: '#4caf50', mr: 2 }}>phone</Icon>
                <MDBox>
                  <MDTypography variant="body2" fontWeight="medium">Phone Support</MDTypography>
                  <MDTypography variant="caption" color="text">+1 (555) 123-4567</MDTypography>
                </MDBox>
              </MDBox>
              
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ color: '#ff9800', mr: 2 }}>schedule</Icon>
                <MDBox>
                  <MDTypography variant="body2" fontWeight="medium">Operating Hours</MDTypography>
                  <MDTypography variant="caption" color="text">24/7 - Always Available</MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton variant="outlined" color="secondary" onClick={() => setSupportDialog(false)}>
              Close
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ChatPlatform;
