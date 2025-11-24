import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Divider,
  Badge,
  Chip,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function EnhancedAdminChat() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setRooms([
        { 
          id: 1, 
          user_name: "John Doe", 
          user_email: "john@example.com",
          last_message: { message: "Hello, I need help", created_at: new Date() },
          admin_unread_count: 2
        },
        { 
          id: 2, 
          user_name: "Jane Smith", 
          user_email: "jane@example.com",
          last_message: { message: "Thank you for your help", created_at: new Date() },
          admin_unread_count: 0
        }
      ]);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectRoom = async (room) => {
    setSelectedRoom(room);
    setMessages([
      {
        id: 1,
        message: "Hello, I need help with my loan application",
        timestamp: new Date(),
        isOwnMessage: false,
        senderName: room.user_name,
        status: 'read'
      },
      {
        id: 2,
        message: "Hello! I'm here to help. What specific assistance do you need?",
        timestamp: new Date(),
        isOwnMessage: true,
        senderName: 'You',
        status: 'read'
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || sending) return;

    try {
      setSending(true);
      
      const newMsg = {
        id: Date.now(),
        message: newMessage.trim(),
        timestamp: new Date(),
        isOwnMessage: true,
        senderName: 'You',
        status: 'sent'
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRooms = rooms.filter((room) =>
    room.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            💬 Admin Chat Dashboard
          </MDTypography>
          <MDButton
            variant="outlined"
            color="info"
            startIcon={<RefreshIcon />}
            onClick={loadRooms}
            disabled={loading}
          >
            Refresh
          </MDButton>
        </MDBox>

        <Grid container spacing={3} sx={{ height: "700px" }}>
          {/* Conversations List */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <MDBox p={2} borderBottom="1px solid #e0e0e0">
                <TextField
                  fullWidth
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />,
                  }}
                  size="small"
                />
              </MDBox>
              
              <MDBox sx={{ flex: 1, overflow: "auto" }}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <List sx={{ p: 0 }}>
                    {filteredRooms.length === 0 ? (
                      <ListItem>
                        <ListItemText 
                          primary="No conversations found" 
                          secondary={searchQuery ? "Try a different search" : "No active chats"}
                        />
                      </ListItem>
                    ) : (
                      filteredRooms.map((room) => (
                        <ListItem
                          key={room.id}
                          button
                          selected={selectedRoom?.id === room.id}
                          onClick={() => selectRoom(room)}
                          sx={{
                            borderBottom: "1px solid #f0f0f0",
                            "&.Mui-selected": {
                              bgcolor: "action.selected",
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={room.admin_unread_count || 0}
                              color="error"
                              invisible={!room.admin_unread_count}
                            >
                              <Avatar sx={{ bgcolor: "primary.main" }}>
                                <PersonIcon />
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={room.user_name || room.user_email}
                            secondary={
                              <MDBox>
                                <MDTypography
                                  variant="body2"
                                  color="text"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {room.last_message?.message || "No messages yet"}
                                </MDTypography>
                                {room.last_message?.created_at && (
                                  <MDTypography variant="caption" color="text" sx={{ opacity: 0.6 }}>
                                    {formatTime(room.last_message.created_at)}
                                  </MDTypography>
                                )}
                              </MDBox>
                            }
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Chat Messages */}
          <Grid item xs={12} md={8}>
            {selectedRoom ? (
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Chat Header */}
                <MDBox
                  p={2}
                  borderBottom="1px solid #e0e0e0"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <MDBox display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                      <PersonIcon />
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6">
                        {selectedRoom.user_name || selectedRoom.user_email}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                        {selectedRoom.user_email}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  
                  <Chip
                    label={`${messages.length} messages`}
                    size="small"
                    variant="outlined"
                  />
                </MDBox>

                {/* Messages */}
                <MDBox
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    p: 2,
                    bgcolor: "#fafafa",
                  }}
                >
                  {messages.length === 0 ? (
                    <MDBox textAlign="center" py={4}>
                      <MDTypography variant="body2" color="text" sx={{ opacity: 0.6 }}>
                        No messages in this conversation yet
                      </MDTypography>
                    </MDBox>
                  ) : (
                    messages.map((message) => (
                      <MDBox
                        key={message.id}
                        display="flex"
                        justifyContent={message.isOwnMessage ? "flex-end" : "flex-start"}
                        mb={1.5}
                      >
                        <MDBox maxWidth="70%">
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1.5,
                              bgcolor: message.isOwnMessage ? '#e3f2fd' : '#fff',
                              borderRadius: '12px',
                              borderTopRightRadius: message.isOwnMessage ? '4px' : '12px',
                              borderTopLeftRadius: message.isOwnMessage ? '12px' : '4px',
                              border: '1px solid #e0e0e0',
                            }}
                          >
                            <MDTypography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {message.message}
                            </MDTypography>
                            
                            <MDBox
                              display="flex"
                              justifyContent="flex-end"
                              alignItems="center"
                              mt={0.5}
                              gap={0.5}
                            >
                              <MDTypography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                                {formatTime(message.timestamp)}
                              </MDTypography>
                            </MDBox>
                          </Paper>
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
                      <AttachFileIcon />
                    </IconButton>
                    
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      variant="outlined"
                      size="small"
                    />
                    
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                        "&.Mui-disabled": {
                          bgcolor: "grey.300",
                        },
                      }}
                    >
                      {sending ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SendIcon />
                      )}
                    </IconButton>
                  </MDBox>
                </MDBox>
              </Card>
            ) : (
              <Card sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MDBox textAlign="center">
                  <PersonIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                  <MDTypography variant="h6" color="text" sx={{ opacity: 0.6 }}>
                    Select a conversation to start chatting
                  </MDTypography>
                </MDBox>
              </Card>
            )}
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default EnhancedAdminChat;