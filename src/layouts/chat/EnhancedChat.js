import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Chip,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Divider,
  Box,
} from '@mui/material';
import {
  Send,
  AttachFile,
  Reply,
  Close,
  Check,
  DoneAll,
  Schedule,
} from '@mui/icons-material';

// Material Dashboard 2 React components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Hooks and services
import { useUserData } from 'context/AppDataContext';
import chatService from 'services/chatService';

// Simple WebSocket helpers (placeholder for now)
const connectSocket = (roomId) => {
  console.log('WebSocket connecting to room:', roomId);
  return null;
};

const onSocketMessage = (callback) => {
  console.log('WebSocket message listener setup');
  return () => console.log('WebSocket unsubscribed');
};

const emitMessage = (roomId, messageData) => {
  console.log('Emitting message to room:', roomId, messageData);
};

// Format timestamp helper
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Chat Message Component
function ChatMessage({ 
  messageId, 
  message, 
  isOwnMessage, 
  timestamp, 
  status = 'sent', 
  senderName, 
  replyTo,
  attachment,
  onReply 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setMenuAnchor(event.currentTarget);
    setShowMenu(true);
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'sent':
        return <Schedule sx={{ fontSize: 14, opacity: 0.6 }} />;
      case 'delivered':
        return <Check sx={{ fontSize: 14, opacity: 0.6 }} />;
      case 'read':
        return <DoneAll sx={{ fontSize: 14, color: '#4fc3f7' }} />;
      default:
        return null;
    }
  };

  return (
    <MDBox mb={1}>
      <MDBox 
        display="flex" 
        justifyContent={isOwnMessage ? 'flex-end' : 'flex-start'}
      >
        <MDBox 
          maxWidth="70%" 
          onContextMenu={handleContextMenu}
          sx={{ cursor: 'pointer' }}
        >
          <Card
            sx={{
              p: 2,
              bgcolor: isOwnMessage ? '#dcf8c6' : '#ffffff',
              borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {/* Reply context */}
            {replyTo && (
              <MDBox 
                mb={1} 
                p={1} 
                sx={{ 
                  bgcolor: 'rgba(0,0,0,0.05)', 
                  borderLeft: '3px solid #25d366',
                  borderRadius: '4px' 
                }}
              >
                <MDTypography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#25d366',
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  {replyTo.senderName}
                </MDTypography>
                <MDTypography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.8,
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxHeight: '20px',
                    fontSize: '0.875rem'
                  }}
                >
                  {replyTo.message}
                </MDTypography>
              </MDBox>
            )}
            
            {/* Attachment */}
            {attachment && (
              <MDBox mb={1}>
                <Chip
                  icon={<AttachFile />}
                  label={attachment.name || 'File'}
                  variant="outlined"
                  size="small"
                  onClick={() => window.open(attachment.url, '_blank')}
                />
              </MDBox>
            )}
            
            <MDTypography
              variant="body2"
              sx={{ 
                wordBreak: 'break-word',
                lineHeight: 1.4,
                fontSize: '0.95rem'
              }}
            >
              {message}
            </MDTypography>
            
            {/* Message info */}
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
                  color: isOwnMessage ? '#666' : '#999'
                }}
              >
                {formatTime(timestamp)}
              </MDTypography>
              {isOwnMessage && getStatusIcon()}
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={showMenu}
        onClose={() => setShowMenu(false)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          onReply && onReply({ messageId, message, senderName, isOwnMessage });
          setShowMenu(false);
        }}>
          <Reply sx={{ mr: 1, fontSize: 18 }} />
          Reply
        </MenuItem>
      </Menu>
    </MDBox>
  );
}

// Reply Preview Component
function ReplyPreview({ replyingTo, onCancel }) {
  if (!replyingTo) return null;

  return (
    <MDBox
      sx={{
        p: 2,
        bgcolor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        borderLeft: '3px solid #25d366',
      }}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="start">
        <MDBox flex={1}>
          <MDTypography variant="caption" sx={{ fontWeight: 600, color: '#25d366' }}>
            Replying to {replyingTo.isOwnMessage ? 'yourself' : replyingTo.senderName}
          </MDTypography>
          <MDTypography 
            variant="body2" 
            sx={{ 
              opacity: 0.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '300px'
            }}
          >
            {replyingTo.message}
          </MDTypography>
        </MDBox>
        <IconButton size="small" onClick={onCancel}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </MDBox>
    </MDBox>
  );
}

// Main Enhanced Chat Component
function EnhancedChat() {
  const { user } = useUserData();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState("");
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation on mount
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);
        
        // Get or create chat room
        const roomResponse = await fetch('/api/chat/rooms/my_room/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          setRoomId(roomData.room.id);
          
          // Load messages for this room
          const messagesResponse = await fetch(`/api/chat/messages/?room_id=${roomData.room.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            const formattedMessages = messagesData.results?.map(msg => ({
              id: msg.id,
              messageId: msg.id,
              message: msg.message,
              timestamp: new Date(msg.created_at),
              isOwnMessage: msg.sender_type === 'user',
              senderName: msg.sender_type === 'admin' ? 'Admin Support' : 'You',
              status: msg.is_read ? 'read' : 'delivered',
              replyTo: msg.reply_to ? {
                messageId: msg.reply_to.id,
                message: msg.reply_to.message,
                senderName: msg.reply_to.sender_type === 'admin' ? 'Admin Support' : 'You'
              } : null,
              attachment: msg.attachment ? {
                name: msg.attachment_name,
                url: msg.attachment
              } : null
            })) || [];
            
            setMessages(formattedMessages);
          }
        }
        
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadConversation();
    }
  }, [user]);

  // WebSocket connection
  useEffect(() => {
    if (!roomId) return;
    
    const socket = connectSocket(roomId);
    const unsubscribe = onSocketMessage((data) => {
      if (data.type === 'message' && data.room_id === roomId) {
        setMessages(prev => [...prev, {
          id: data.message.id,
          messageId: data.message.id,
          message: data.message.message,
          timestamp: new Date(data.message.created_at),
          isOwnMessage: false,
          senderName: 'Admin Support',
          status: 'delivered'
        }]);
      }
      
      if (data.type === 'typing') {
        setIsTyping(data.isTyping);
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [roomId]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId || sending) return;
    
    try {
      setSending(true);
      
      const messageData = {
        message: newMessage.trim(),
        room_id: roomId,
        reply_to: replyingTo?.messageId || null
      };
      
      const response = await fetch('/api/chat/messages/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });
      
      if (response.ok) {
        const sentMessage = await response.json();
        
        setMessages(prev => [...prev, {
          id: sentMessage.id,
          messageId: sentMessage.id,
          message: sentMessage.message,
          timestamp: new Date(sentMessage.created_at),
          isOwnMessage: true,
          senderName: 'You',
          status: 'sent',
          replyTo: replyingTo ? {
            messageId: replyingTo.messageId,
            message: replyingTo.message,
            senderName: replyingTo.senderName
          } : null
        }]);
        
        // Emit via WebSocket
        emitMessage(roomId, {
          message: sentMessage.message,
          sender: 'user'
        });
        
        setNewMessage("");
        setReplyingTo(null);
        
        // Update status to delivered after a delay
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === sentMessage.id ? { ...msg, status: 'delivered' } : msg
          ));
        }, 1000);
        
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleReply = (messageData) => {
    setReplyingTo(messageData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (file) => {
    console.log('File upload:', file);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

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
            {adminOnline ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
                Admin Support is online
              </Box>
            ) : (
              `Last seen: ${lastSeen}`
            )}
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
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"none\\" fill-rule=\\"evenodd\\"%3E%3Cg fill=\\"\\%23e0e0e0\\" fill-opacity=\\"0.1\\"%3E%3Ccircle cx=\\"30\\" cy=\\"30\\" r=\\"2\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          >
            {messages.length === 0 ? (
              <MDBox textAlign="center" py={4}>
                <MDTypography variant="body2" color="text" opacity={0.6}>
                  Start a conversation with our support team
                </MDTypography>
              </MDBox>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  messageId={msg.messageId}
                  message={msg.message}
                  isOwnMessage={msg.isOwnMessage}
                  timestamp={msg.timestamp}
                  status={msg.status}
                  senderName={msg.senderName}
                  replyTo={msg.replyTo}
                  attachment={msg.attachment}
                  onReply={handleReply}
                />
              ))
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <MDBox display="flex" justifyContent="flex-start" mb={2}>
                <Card sx={{ p: 2, bgcolor: '#ffffff', borderRadius: '18px' }}>
                  <MDBox display="flex" gap={0.5}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#9e9e9e',
                          animation: 'typing 1.4s infinite',
                          animationDelay: `${i * 0.2}s`,
                          '@keyframes typing': {
                            '0%, 60%, 100%': { transform: 'translateY(0)' },
                            '30%': { transform: 'translateY(-6px)' }
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

          {/* Reply Preview */}
          <ReplyPreview 
            replyingTo={replyingTo} 
            onCancel={() => setReplyingTo(null)} 
          />

          <Divider />

          {/* Message Input */}
          <MDBox p={2}>
            <MDBox display="flex" alignItems="flex-end" gap={1}>
              {/* File upload */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              />
              <IconButton 
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <AttachFile />
              </IconButton>
              
              {/* Message input */}
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                  }
                }}
              />
              
              {/* Send button */}
              <IconButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
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
                {sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
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