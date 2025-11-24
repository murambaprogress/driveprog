import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  TextField,
  IconButton,
  CircularProgress,
  Divider,
  Box,
} from '@mui/material';
import {
  Send,
  AttachFile,
} from '@mui/icons-material';

import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Test context import
import { useUserData } from 'context/AppDataContext';

function EnhancedChat() {
  const { user } = useUserData();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [roomId, setRoomId] = useState(1); // Mock room ID for now
  const messagesEndRef = useRef(null);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      
      // Create new message object
      const newMsg = {
        id: Date.now(),
        message: newMessage.trim(),
        timestamp: new Date(),
        isOwnMessage: true,
        senderName: user?.first_name || 'You',
        status: 'sent'
      };
      
      // Add message to local state
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      
      // TODO: Send to backend API
      console.log('Sending message:', newMsg.message);
      
      // Simulate delivery status update
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" color="text" mb={1}>
            💬 Support Chat
          </MDTypography>
          <MDTypography variant="body2" color="text" opacity={0.7}>
            Welcome {user?.first_name || 'User'}! Chat with our support team.
          </MDTypography>
        </MDBox>

        {/* Chat Container */}
        <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area */}
          <MDBox
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#fafafa',
            }}
          >
            {messages.length === 0 ? (
              <MDBox textAlign="center" py={4}>
                <MDTypography variant="body2" color="text" opacity={0.6}>
                  Start a conversation with our support team
                </MDTypography>
                <MDTypography variant="caption" color="text" opacity={0.5}>
                  Type a message below to get started
                </MDTypography>
              </MDBox>
            ) : (
              messages.map((msg) => (
                <MDBox
                  key={msg.id}
                  display="flex"
                  justifyContent={msg.isOwnMessage ? "flex-end" : "flex-start"}
                  mb={1.5}
                >
                  <MDBox maxWidth="70%">
                    <Card
                      sx={{
                        p: 1.5,
                        bgcolor: msg.isOwnMessage ? '#dcf8c6' : '#ffffff',
                        borderRadius: msg.isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <MDTypography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {msg.message}
                      </MDTypography>
                      
                      <MDBox
                        display="flex"
                        justifyContent="flex-end"
                        alignItems="center"
                        mt={0.5}
                        gap={0.5}
                      >
                        <MDTypography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.75rem',
                            opacity: 0.7,
                            color: msg.isOwnMessage ? '#666' : '#999'
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </MDTypography>
                        {msg.isOwnMessage && (
                          <MDBox sx={{ fontSize: '0.75rem', opacity: 0.6 }}>
                            {msg.status === 'sent' && '✓'}
                            {msg.status === 'delivered' && '✓✓'}
                            {msg.status === 'read' && '✓✓'}
                          </MDBox>
                        )}
                      </MDBox>
                    </Card>
                  </MDBox>
                </MDBox>
              ))
            )}
            <div ref={messagesEndRef} />
          </MDBox>

          <Divider />

          {/* Message Input */}
          <MDBox p={2}>
            <MDBox display="flex" alignItems="flex-end" gap={1}>
              <IconButton disabled>
                <AttachFile />
              </IconButton>
              
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                  }
                }}
              />
              
              <IconButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'grey.300',
                  }
                }}
              >
                <Send />
              </IconButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default EnhancedChat;