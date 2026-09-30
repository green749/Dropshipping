import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAppDispatch, useAppSelector } from '../../store';
import { setChatDrawerOpen, toggleChatDrawer, setSelectedPartnerId } from '../../store/slices/chatSlice';
import {
  MessageSquare,
  X,
  Send,
  ArrowLeft,
  Paperclip,
  CheckCheck,
  Check,
  Search,
  Users,
  Circle,
  Megaphone,
  ChevronDown,
  Building2,
  UserCheck,
} from 'lucide-react';

export const FloatingChatWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isChatDrawerOpen } = useAppSelector((state) => state.chat);
  const { selectedBusiness } = useAppSelector((state) => state.business);

  const {
    currentUser,
    isAdmin,
    contacts,
    selectedPartnerId,
    selectedPartner,
    currentMessages,
    onlineUserIds,
    isPartnerOnline,
    isPartnerTyping,
    totalUnreadCount,
    isLoadingContacts,
    isLoadingMessages,
    isSending,
    selectPartner,
    fetchMessages,
    sendMessage,
    sendBroadcast,
    sendTyping,
  } = useChat();

  // 'list' = small screen only users, 'chat' = conversation view
  const [activeScreen, setActiveScreen] = useState<'list' | 'chat'>('list');
  const [inputContent, setInputContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleTab, setSelectedRoleTab] = useState<'ALL' | 'DEALER' | 'MARKETING' | 'SALES'>('ALL');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastTargetRole, setBroadcastTargetRole] = useState<'ALL' | 'DEALER' | 'MARKETING' | 'SALES'>('ALL');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When opening widget or when contacts change, non-admin users (Dealers, Marketers, Sales) land directly in conversation view with the Business Owner
  useEffect(() => {
    if (!isAdmin && contacts.length > 0) {
      setActiveScreen('chat');
      const adminContact = contacts.find((c) => c.role === 'DROPSHIPPER' || (c as any).isPlatformAdmin) || contacts[0];
      if (adminContact && selectedPartnerId !== adminContact.id) {
        selectPartner(adminContact.id);
      }
    } else if (isChatDrawerOpen && isAdmin && !selectedPartnerId) {
      setActiveScreen('list');
    }
  }, [isChatDrawerOpen, isAdmin, contacts, selectedPartnerId, selectPartner]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (activeScreen === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, isPartnerTyping, activeScreen]);

  // Role tabs: Only the Business Owner (DROPSHIPPER) needs role categorization tabs
  const availableRoleTabs = useMemo(() => {
    if (currentUser?.role === 'DROPSHIPPER') {
      return [
        { id: 'ALL', label: 'All' },
        { id: 'DEALER', label: 'Dealer' },
        { id: 'MARKETING', label: 'Digital Marketer' },
        { id: 'SALES', label: 'Sales' },
      ];
    }
    return [];
  }, [currentUser?.role]);

  // Filter contacts: Non-admin users (Dealers, Marketers, Sales) MUST ONLY see the Business Owner
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // 1. Non-admin users see exclusively the Business Owner (Admin / DROPSHIPPER)
      if (!isAdmin) {
        const isOwner = c.role === 'DROPSHIPPER' || (c as any).isPlatformAdmin;
        if (!isOwner) return false;
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = c.name.toLowerCase().includes(term);
          const matchEmail = c.email.toLowerCase().includes(term);
          return matchName || matchEmail;
        }
        return true;
      }

      // 2. Role tab filter for Admin (ALL | DEALER | MARKETING | SALES)
      if (selectedRoleTab !== 'ALL') {
        if (c.role !== selectedRoleTab) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = c.name.toLowerCase().includes(term);
        const matchEmail = c.email.toLowerCase().includes(term);
        const matchRole = c.role.toLowerCase().includes(term);
        const matchCompany = (c.company_name || '').toLowerCase().includes(term);
        if (!matchName && !matchEmail && !matchRole && !matchCompany) return false;
      }

      return true;
    });
  }, [
    contacts,
    isAdmin,
    selectedRoleTab,
    searchTerm,
  ]);

  const handleSelectUser = (partnerId: string) => {
    selectPartner(partnerId);
    fetchMessages(partnerId);
    setActiveScreen('chat');
  };

  const handleBackToList = () => {
    setActiveScreen('list');
    dispatch(setSelectedPartnerId(null));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputContent(e.target.value);
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1500);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || isSending) return;

    sendMessage(inputContent);
    setInputContent('');
    sendTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) return;
    sendBroadcast(broadcastContent, broadcastTargetRole);
    setBroadcastContent('');
    setIsBroadcastModalOpen(false);
  };

  const getAvatarBg = (name: string) => {
    const char = (name || 'U').charAt(0).toUpperCase();
    switch (char) {
      case 'D':
        return 'bg-[#16123F] text-white';
      case 'A':
        return 'bg-[#1B8A5A] text-white';
      case 'E':
        return 'bg-[#A855F7] text-white';
      case 'M':
        return 'bg-[#0F172A] text-white';
      case 'S':
        return 'bg-[#2563EB] text-white';
      default:
        return 'bg-[#16123F] text-white';
    }
  };

  const formatTimestamp = (dateStr?: string | Date | number) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateStr?: string | Date | number) => {
    if (!dateStr) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCleanSubtitle = (contact: any) => {
    if (contact.lastMessage?.content) {
      return contact.lastMessage.content;
    }
    if (contact.role === 'DROPSHIPPER' || contact.isPlatformAdmin) {
      return 'Business Owner (Admin)';
    }
    if (contact.company_name) {
      return contact.company_name;
    }
    switch (contact.role) {
      case 'DEALER':
        return 'Authorized Dealer';
      case 'SALES':
        return 'Sales Representative';
      case 'MARKETING':
        return 'Digital Marketer';
      default:
        return 'Active Member';
    }
  };

  const audienceRoles = [
    {
      id: 'ALL',
      label: 'All Partners (Everyone)',
      desc: 'Dealers, Marketing & Sales teams',
      icon: Users,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'DEALER',
      label: 'Dealers & Suppliers Only',
      desc: 'Supply chain & inventory announcements',
      icon: Building2,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'MARKETING',
      label: 'Digital Marketers Only',
      desc: 'Campaigns, creative assets & promotion updates',
      icon: Megaphone,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'SALES',
      label: 'Sales Representatives Only',
      desc: 'Commission, discounts & buyer promotions',
      icon: UserCheck,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
  ];

  const selectedRoleOption = audienceRoles.find((r) => r.id === broadcastTargetRole) || audienceRoles[0];

  if (!currentUser) return null;

  const activeContact =
    (selectedPartnerId ? contacts.find((c) => c.id === selectedPartnerId) : null) ||
    selectedPartner ||
    (!isAdmin && contacts.length > 0 ? contacts[0] : null);

  return (
    <>
      {/* ─── Floating Circular Chat Toggle Button ─── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleChatDrawer())}
          className="relative w-14 h-14 rounded-full bg-[#16123F] hover:bg-[#16123F]/90 text-white flex items-center justify-center shadow-2xl shadow-[#16123F]/40 border-2 border-white/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Toggle Real-Time Chat"
        >
          {isChatDrawerOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 text-[#FFE26A]" />
              {totalUnreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                  </span>
                  <span className="absolute -top-1 -right-1 z-0 w-5 h-5 rounded-full bg-rose-500 animate-ping opacity-75"></span>
                </>
              )}
            </>
          )}
        </button>
      </div>

      {/* ─── Real-Time Chat Window (Single-Screen Modal like Mockup) ─── */}
      {isChatDrawerOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex items-end justify-end">
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 1: USERS LIST VIEW (Small Screen Showing ONLY Users Initially)  */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeScreen === 'list' && (
            <div className="w-[330px] sm:w-[360px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-scale-in">
              {/* Top Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#16123F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedBusiness?.name ? selectedBusiness.name.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">
                      {selectedBusiness?.name || 'Business Workspace'}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {!isAdmin
                        ? 'Business Owner (Admin)'
                        : `${filteredContacts.length} ${filteredContacts.length === 1 ? 'contact' : 'contacts'}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isAdmin && (
                    <button
                      onClick={() => setIsBroadcastModalOpen(true)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#16123F] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Broadcast Announcement"
                    >
                      <Megaphone className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dispatch(setChatDrawerOpen(false))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* User Type Filter Tabs (Admin Only) */}
              {availableRoleTabs.length > 0 && (
                <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-50/60">
                  {availableRoleTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedRoleTab(tab.id as any)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedRoleTab === tab.id
                          ? 'bg-[#16123F] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Bar */}
              <div className="p-3 border-b border-slate-100 bg-white">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 outline-none focus:border-[#16123F] focus:bg-white"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {isLoadingContacts ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Loading users...
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                    <Users className="w-6 h-6 mx-auto text-slate-300" />
                    <p>No contacts available for this role/business</p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => {
                    const isSelected = selectedPartnerId === contact.id;
                    const isOnline = onlineUserIds.includes(contact.id);

                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectUser(contact.id)}
                        className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#F0F2FA]'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarBg(contact.name)}`}>
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            {isOnline && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {contact.name}
                              </span>
                              {contact.role === 'DEALER' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  Dealer
                                </span>
                              )}
                              {contact.role === 'SALES' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                                  Sales
                                </span>
                              )}
                              {contact.role === 'MARKETING' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                  Marketer
                                </span>
                              )}
                              {contact.role === 'DROPSHIPPER' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {getCleanSubtitle(contact)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          {contact.lastMessage && (
                            <span className="text-[10px] text-slate-400 block">
                              {formatTimestamp(
                                contact.lastMessage.created_at ||
                                  (contact.lastMessage as any).createdAt ||
                                  (contact.lastMessage as any).timestamp
                              )}
                            </span>
                          )}
                          {contact.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold mt-1">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 2: CONVERSATION DETAILS VIEW (Shown when user is clicked)    */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeScreen === 'chat' && (
            <div className="w-[330px] sm:w-[360px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-scale-in">
              {/* Chat Top Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {isAdmin && (
                    <button
                      onClick={handleBackToList}
                      className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Back to users list"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}

                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarBg(activeContact?.name || 'User')}`}>
                      {activeContact?.name ? activeContact.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {isPartnerOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {activeContact?.name || 'Conversation'}
                      </h3>
                      {activeContact?.role && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {activeContact.role === 'DEALER'
                            ? 'Dealer'
                            : activeContact.role === 'MARKETING'
                            ? 'Marketer'
                            : activeContact.role === 'SALES'
                            ? 'Sales'
                            : 'Admin'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Circle
                        className={`w-1.5 h-1.5 fill-current ${
                          isPartnerOnline ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      <span>{isPartnerOnline ? 'Online' : 'Offline'}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(setChatDrawerOpen(false))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFC]">
                {/* Date Divider Pill */}
                <div className="flex justify-center my-1">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                    Today
                  </span>
                </div>

                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-32 text-xs text-slate-400">
                    Loading conversation...
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      No messages with {activeContact?.name || 'this user'} yet.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Send a message below to start a live conversation.
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isOwn = msg.sender_id === (currentUser?.id || '');
                    const isBroadcast = msg.message_type === 'BROADCAST';

                    if (isBroadcast) {
                      return (
                        <div key={msg.id} className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs space-y-1">
                          <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wide">
                            Announcement ({msg.target_role || 'ALL'})
                          </span>
                          <p className="text-slate-800">{msg.content}</p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${getAvatarBg(activeContact?.name || 'P')}`}>
                            {activeContact?.name ? activeContact.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                        )}

                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                            isOwn
                              ? 'bg-[#DCF8E6] text-[#0A2619] rounded-tr-xs font-normal'
                              : 'bg-[#F0F2F6] text-slate-900 rounded-tl-xs font-normal'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                            <span>
                              {formatMessageTime(
                                msg.created_at || (msg as any).createdAt || (msg as any).timestamp
                              )}
                            </span>
                            {isOwn && (
                              msg.is_read ? (
                                <CheckCheck className="w-3 h-3 text-sky-500" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-400" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Live Typing Indicator */}
                {isPartnerTyping && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic bg-slate-100 px-3 py-1.5 rounded-full w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
                    <span>{activeContact?.name || 'User'} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Pill Bar */}
              <form onSubmit={handleSend} noValidate className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 focus-within:border-[#16123F] focus-within:bg-white transition-all">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 p-1 mr-1 transition-colors cursor-pointer"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputContent}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputContent.trim() || isSending}
                  className="w-9 h-9 rounded-full bg-[#16123F] hover:bg-[#16123F]/90 text-white flex items-center justify-center shadow-md disabled:opacity-40 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4 text-white ml-0.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ─── BROADCAST ANNOUNCEMENT MODAL (Admin) ─── */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Broadcast Announcement</h3>
                <p className="text-xs text-slate-400">Send an instant alert to partner channels</p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} noValidate className="space-y-4">
              {/* Custom High-End Role Dropdown Selector */}
              <div className="space-y-1.5" ref={roleDropdownRef}>
                <label className="text-xs font-bold text-slate-700 block">
                  Target Audience Role
                </label>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition-all cursor-pointer focus:border-[#16123F] focus:bg-white focus:ring-2 focus:ring-[#16123F]/5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                        {selectedRoleOption.label}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {selectedRoleOption.desc}
                      </p>
                    </div>

                    <div className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isRoleDropdownOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Dropdown Menu Popover */}
                  {isRoleDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden divide-y divide-slate-50 animate-scale-in">
                      {audienceRoles.map((role) => {
                        const isSelected = broadcastTargetRole === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => {
                              setBroadcastTargetRole(role.id as any);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full p-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                              isSelected ? 'bg-[#F0F2FA]' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                {role.label}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {role.desc}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#16123F] text-white flex items-center justify-center shrink-0 ml-2">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Content Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Announcement Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Type your official announcement..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#16123F] focus:bg-white focus:ring-2 focus:ring-[#16123F]/5 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!broadcastContent.trim() || isSending}
                  className="px-5 py-2.5 rounded-xl bg-[#16123F] hover:bg-[#16123F]/90 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-[#16123F]/20 transition-all cursor-pointer"
                >
                  <span>{isSending ? 'Broadcasting...' : 'Send Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
