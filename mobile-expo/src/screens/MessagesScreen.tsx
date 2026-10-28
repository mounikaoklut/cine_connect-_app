import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Search,
  MessageSquare,
  Send,
  Video,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  Paperclip,
  X,
  Calendar,
  Film,
} from 'lucide-react-native';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { MESSAGES_DATA } from '../data/mockData';
import { MessageThread } from '../types';

export default function MessagesScreen() {
  const [threads, setThreads] = useState<MessageThread[]>(MESSAGES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredThreads = threads.filter(
    (t) =>
      t.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.projectContext &&
        t.projectContext.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenThread = (thread: MessageThread) => {
    setActiveThread(thread);
    // Mark as read
    setThreads((prev) =>
      prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
    );
  };

  const handleSendMessage = () => {
    if (!replyText.trim() || !activeThread) return;
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text: replyText.trim(),
      time: 'Just now',
    };

    const updatedThread: MessageThread = {
      ...activeThread,
      lastMessage: replyText.trim(),
      timestamp: 'Just now',
      messages: [...activeThread.messages, newMessage],
    };

    setActiveThread(updatedThread);
    setThreads((prev) =>
      prev.map((t) => (t.id === updatedThread.id ? updatedThread : t))
    );
    setReplyText('');
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Security Banner */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>Studio Messages</Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>Live Inquiries</Text>
            </View>
          </View>
          <Text style={styles.subtitleText}>
            Direct communication channels with verified casting directors, producers, and showrunners.
          </Text>
        </View>

        {/* DPDP Compliant Encryption Tag */}
        <View style={styles.complianceCard}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.complianceText}>
            End-to-End Encrypted &bull; DPDP 2026 Watermark Protected
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search directors, casting calls, or productions..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Thread List */}
        <View style={styles.threadList}>
          {filteredThreads.map((thread) => (
            <TouchableOpacity
              key={thread.id}
              activeOpacity={0.8}
              onPress={() => handleOpenThread(thread)}
            >
              <GlassCard
                style={[
                  styles.threadCard,
                  thread.unread && styles.unreadThreadCard,
                ]}
              >
                <View style={styles.threadHeader}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{ uri: thread.avatar }}
                      style={styles.avatarImage}
                    />
                    <View style={styles.onlineDot} />
                  </View>

                  <View style={styles.threadInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.senderName}>{thread.sender}</Text>
                      <Text style={styles.timestampText}>{thread.timestamp}</Text>
                    </View>

                    <Text style={styles.roleText} numberOfLines={1}>
                      {thread.role}
                    </Text>

                    {thread.projectContext && (
                      <View style={styles.projectTag}>
                        <Film size={11} color="#F59E0B" />
                        <Text style={styles.projectTagText} numberOfLines={1}>
                          {thread.projectContext}
                        </Text>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.lastMessageText,
                        thread.unread && styles.unreadLastMessage,
                      ]}
                      numberOfLines={2}
                    >
                      {thread.lastMessage}
                    </Text>
                  </View>
                </View>

                {thread.unread && (
                  <View style={styles.unreadPill}>
                    <Text style={styles.unreadPillText}>New Inquiry</Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* ================= Live Conversation Modal ================= */}
      <Modal
        visible={!!activeThread}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveThread(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              {activeThread && (
                <Image
                  source={{ uri: activeThread.avatar }}
                  style={styles.modalAvatar}
                />
              )}
              <View>
                <Text style={styles.modalSenderName}>
                  {activeThread?.sender}
                </Text>
                <Text style={styles.modalRoleText} numberOfLines={1}>
                  {activeThread?.role}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setActiveThread(null)}
              style={styles.closeButton}
            >
              <X size={20} color="#E2E8F0" />
            </TouchableOpacity>
          </View>

          {/* Project Context Bar in Modal */}
          {activeThread?.projectContext && (
            <View style={styles.modalContextBar}>
              <Sparkles size={14} color="#F59E0B" />
              <Text style={styles.modalContextText}>
                Production: {activeThread.projectContext}
              </Text>
            </View>
          )}

          {/* Messages Scroll View */}
          <ScrollView
            style={styles.messagesScrollView}
            contentContainerStyle={styles.messagesScrollContent}
          >
            {activeThread?.messages.map((m) => {
              const isMe = m.sender === 'user';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubbleWrapper,
                    isMe
                      ? styles.messageBubbleMeWrapper
                      : styles.messageBubbleOtherWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMe ? styles.messageTextMe : styles.messageTextOther,
                      ]}
                    >
                      {m.text}
                    </Text>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeText}>{m.time}</Text>
                      {isMe && <CheckCheck size={12} color="#94A3B8" />}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Reply Composer Input */}
          <View style={styles.composerBar}>
            <TouchableOpacity style={styles.attachButton}>
              <Paperclip size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TextInput
              style={styles.composerInput}
              placeholder="Write a message, self-tape link, or pitch..."
              placeholderTextColor="#64748B"
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />

            <TouchableOpacity
              onPress={handleSendMessage}
              style={[
                styles.sendButton,
                !replyText.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!replyText.trim()}
            >
              <Send size={18} color="#0B0F17" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titleSection: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activeBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  subtitleText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  complianceText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F30',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    padding: 0,
  },
  threadList: {
    gap: 12,
  },
  threadCard: {
    padding: 14,
  },
  unreadThreadCard: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0B0F17',
  },
  threadInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  timestampText: {
    fontSize: 11,
    color: '#64748B',
  },
  roleText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  projectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 6,
  },
  projectTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  lastMessageText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  unreadLastMessage: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  unreadPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unreadPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0B0F17',
    textTransform: 'uppercase',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  modalSenderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modalRoleText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 18,
  },
  modalContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.2)',
    gap: 6,
  },
  modalContextText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  messagesScrollView: {
    flex: 1,
  },
  messagesScrollContent: {
    padding: 16,
    gap: 12,
  },
  messageBubbleWrapper: {
    width: '100%',
    flexDirection: 'row',
  },
  messageBubbleMeWrapper: {
    justifyContent: 'flex-end',
  },
  messageBubbleOtherWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleMe: {
    backgroundColor: '#F59E0B',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#0B0F17',
    fontWeight: '600',
  },
  messageTextOther: {
    color: '#F1F5F9',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#64748B',
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
    gap: 10,
  },
  attachButton: {
    padding: 8,
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 14,
    maxHeight: 90,
  },
  sendButton: {
    backgroundColor: '#F59E0B',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
