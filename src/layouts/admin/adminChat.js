/**
 * Admin Chat Interface
 * View all user conversations and respond to messages
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Divider,
  TextField,
  IconButton,
  Box,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import chatService from "services/chatService";

function AdminChat() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadRooms();
    // Load rooms only once on mount, no auto-refresh
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAllRooms();
      setRooms(response);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await chatService.getRoomMessages(roomId);
      setMessages(response.messages || []);
      
      // Mark room as read
      await chatService.markRoomAsRead(roomId);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    await loadMessages(room.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    if (!selectedRoom) return;

    try {
      setSending(true);
      await chatService.sendMessage(selectedRoom.id, newMessage, attachment);
      setNewMessage("");
      setAttachment(null);
      await loadMessages(selectedRoom.id, true);
      await loadRooms(); // Refresh room list
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !selectedRoom) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3} sx={{ height: "calc(100vh - 200px)" }}>
          {/* User List Sidebar */}
          <Grid item xs={12} md={4} lg={3}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <MDBox p={2} display="flex" alignItems="center" justifyContent="space-between">
                <MDTypography variant="h6" fontWeight="medium">
                  Conversations
                </MDTypography>
                <IconButton size="small" onClick={loadRooms}>
                  <RefreshIcon />
                </IconButton>
              </MDBox>
              
              <MDBox px={2} pb={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </MDBox>

              <Divider />

              <List sx={{ flex: 1, overflow: "auto", p: 0 }}>
                {filteredRooms.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body2" color="text">
                      No conversations yet
                    </MDTypography>
                  </MDBox>
                ) : (
                  filteredRooms.map((room) => (
                    <React.Fragment key={room.id}>
                      <ListItem
                        button
                        selected={selectedRoom?.id === room.id}
                        onClick={() => handleRoomSelect(room)}
                        sx={{
                          "&.Mui-selected": {
                            bgcolor: "action.selected",
                          },
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={room.admin_unread_count || 0}
                            color="error"
                            overlap="circular"
                          >
                            <Avatar sx={{ bgcolor: "#2196f3" }}>
                              <PersonIcon />
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <MDBox display="flex" justifyContent="space-between" alignItems="center">
                              <MDTypography variant="button" fontWeight="medium">
                                {room.user_name}
                              </MDTypography>
                              {room.last_message && (
                                <MDTypography variant="caption" color="text">
                                  {formatTime(room.last_message.created_at)}
                                </MDTypography>
                              )}
                            </MDBox>
                          }
                          secondary={
                            <MDBox>
                              <MDTypography variant="caption" color="text" sx={{ display: "block" }}>
                                ID: {room.user}
                              </MDTypography>
                              {room.last_message && (
                                <MDTypography
                                  variant="caption"
                                  color="text"
                                  sx={{
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {room.last_message.sender_type === "admin" ? "You: " : ""}
                                  {room.last_message.message}
                                </MDTypography>
                              )}
                            </MDBox>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Card>
          </Grid>

          {/* Chat Area */}
          <Grid item xs={12} md={8} lg={9}>
            {selectedRoom ? (
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Chat Header */}
                <MDBox
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <MDBox display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: "#2196f3", mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="medium">
                        {selectedRoom.user_name}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        User ID: {selectedRoom.user} • {selectedRoom.user_email}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  <Chip label={selectedRoom.is_active ? "Active" : "Inactive"} color={selectedRoom.is_active ? "success" : "default"} size="small" />
                </MDBox>

                {/* Messages Area */}
                <MDBox
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    p: 3,
                    bgcolor: "#f5f5f5",
                  }}
                >
                  {messages.length === 0 ? (
                    <MDBox textAlign="center" py={8}>
                      <MDTypography variant="body2" color="text">
                        No messages yet. Start the conversation!
                      </MDTypography>
                    </MDBox>
                  ) : (
                    messages.map((msg, index) => {
                      const isAdmin = msg.sender_type === "admin";
                      const showDate =
                        index === 0 ||
                        new Date(msg.created_at).toDateString() !==
                          new Date(messages[index - 1].created_at).toDateString();

                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <MDBox textAlign="center" my={2}>
                              <Chip
                                label={new Date(msg.created_at).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                size="small"
                              />
                            </MDBox>
                          )}
                          <MDBox
                            display="flex"
                            justifyContent={isAdmin ? "flex-end" : "flex-start"}
                            mb={2}
                          >
                            <MDBox
                              display="flex"
                              flexDirection="column"
                              maxWidth="70%"
                              alignItems={isAdmin ? "flex-end" : "flex-start"}
                            >
                              {!isAdmin && (
                                <MDTypography variant="caption" color="text" mb={0.5}>
                                  {msg.sender_name}
                                </MDTypography>
                              )}
                              <Paper
                                elevation={1}
                                sx={{
                                  p: 2,
                                  bgcolor: isAdmin ? "#2196f3" : "white",
                                  color: isAdmin ? "white" : "inherit",
                                  borderRadius: "12px",
                                  borderTopRightRadius: isAdmin ? "4px" : "12px",
                                  borderTopLeftRadius: isAdmin ? "12px" : "4px",
                                }}
                              >
                                <MDTypography
                                  variant="body2"
                                  color={isAdmin ? "white" : "text"}
                                  sx={{ wordBreak: "break-word" }}
                                >
                                  {msg.message}
                                </MDTypography>
                                {msg.attachment && (
                                  <MDBox mt={1}>
                                    <Chip
                                      icon={<AttachFileIcon />}
                                      label={msg.attachment_name || "Attachment"}
                                      size="small"
                                      onClick={() => window.open(msg.attachment, "_blank")}
                                      sx={{ bgcolor: isAdmin ? "rgba(255,255,255,0.2)" : "action.hover" }}
                                    />
                                  </MDBox>
                                )}
                              </Paper>
                              <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
                                <MDTypography variant="caption" color="text">
                                  {formatTime(msg.created_at)}
                                </MDTypography>
                                {isAdmin && msg.is_read && (
                                  <MDTypography variant="caption" color="success">
                                    ✓ Read
                                  </MDTypography>
                                )}
                              </MDBox>
                            </MDBox>
                          </MDBox>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </MDBox>

                {/* Message Input */}
                <MDBox
                  p={2}
                  sx={{ borderTop: 1, borderColor: "divider" }}
                >
                  {attachment && (
                    <MDBox mb={1}>
                      <Chip
                        icon={<AttachFileIcon />}
                        label={attachment.name}
                        onDelete={() => setAttachment(null)}
                        size="small"
                      />
                    </MDBox>
                  )}
                  <MDBox display="flex" gap={1}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileSelect}
                    />
                    <IconButton
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                    >
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
                    />
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleSendMessage}
                      disabled={sending || (!newMessage.trim() && !attachment)}
                      iconOnly
                    >
                      {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            ) : (
              <Card sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MDBox textAlign="center">
                  <MDTypography variant="h6" color="text" mb={1}>
                    Select a conversation
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    Choose a user from the list to start chatting
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

export default AdminChat;
