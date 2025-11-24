/**
 * User Chat Interface
 * Chat with admin support team
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  TextField,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import RefreshIcon from "@mui/icons-material/Refresh";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import chatService from "services/chatService";

function UserChat() {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeChat();
    // Load chat only once on mount, no auto-refresh
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      const roomData = await chatService.getMyRoom();
      setRoom(roomData);
      await loadMessages(roomData.room.id);
    } catch (error) {
      console.error("Error initializing chat:", error);
      // Error handling is done by global interceptor
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    if (!room) return;

    try {
      setSending(true);
      await chatService.sendMessage(room.room.id, newMessage, attachment);
      setNewMessage("");
      setAttachment(null);
      await loadMessages(room.room.id, true);
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
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (loading && !room) {
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
        <Card sx={{ maxWidth: 1000, mx: "auto", height: "calc(100vh - 200px)", display: "flex", flexDirection: "column" }}>
          {/* Chat Header */}
          <MDBox
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <MDBox display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "#4caf50", mr: 2 }}>
                <SupportAgentIcon />
              </Avatar>
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium">
                  DriveCash Support Team
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  We're here to help you 24/7
                </MDTypography>
              </MDBox>
            </MDBox>
            <IconButton onClick={() => room && loadMessages(room.room.id)}>
              <RefreshIcon />
            </IconButton>
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
            {loading ? (
              <MDBox display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </MDBox>
            ) : messages.length === 0 ? (
              <MDBox textAlign="center" py={8}>
                <SupportAgentIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                <MDTypography variant="h6" color="text" mb={1}>
                  Start a conversation
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Have a question? Send us a message and we'll get back to you right away!
                </MDTypography>
              </MDBox>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.sender_type === "user";
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
                      justifyContent={isUser ? "flex-end" : "flex-start"}
                      mb={2}
                    >
                      <MDBox
                        display="flex"
                        flexDirection="column"
                        maxWidth="70%"
                        alignItems={isUser ? "flex-end" : "flex-start"}
                      >
                        {!isUser && (
                          <MDBox display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: "#4caf50" }}>
                              <SupportAgentIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <MDTypography variant="caption" color="text">
                              {msg.sender_name || "Support Team"}
                            </MDTypography>
                          </MDBox>
                        )}
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            bgcolor: isUser ? "#2196f3" : "white",
                            color: isUser ? "white" : "inherit",
                            borderRadius: "12px",
                            borderTopRightRadius: isUser ? "4px" : "12px",
                            borderTopLeftRadius: isUser ? "12px" : "4px",
                          }}
                        >
                          <MDTypography
                            variant="body2"
                            color={isUser ? "white" : "text"}
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
                                sx={{ bgcolor: isUser ? "rgba(255,255,255,0.2)" : "action.hover" }}
                              />
                            </MDBox>
                          )}
                        </Paper>
                        <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
                          <MDTypography variant="caption" color="text">
                            {formatTime(msg.created_at)}
                          </MDTypography>
                          {isUser && msg.is_read && (
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
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserChat;
