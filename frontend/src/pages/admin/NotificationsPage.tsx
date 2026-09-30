import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchNotifications,
  markNotificationRead,
  markAllRead,
} from '../../store/slices/notificationSlice';
import { addToast } from '../../store/slices/uiSlice';
import { mailApi, type EmailLog } from '../../api/mailApi';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Bell,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
  CheckCircle2,
  ShieldAlert,
  Mail,
  Send,
  ExternalLink,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, isLoading } = useAppSelector((state) => state.notification);
  const { user } = useAppSelector((state) => state.auth);

  // Active top tab: IN_APP vs EMAIL_OUTBOX
  const [activeTab, setActiveTab] = useState<'IN_APP' | 'EMAIL_OUTBOX'>('IN_APP');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  // Email Outbox State
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState(user?.email || 'admin@dropship.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [previewingEmail, setPreviewingEmail] = useState<EmailLog | null>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
    fetchEmailLogs();
  }, [dispatch]);

  const fetchEmailLogs = async () => {
    setLoadingEmails(true);
    try {
      const res = await mailApi.getLogs();
      setEmailLogs(res.data || []);
    } catch {
      setEmailLogs([]);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.trim()) {
      dispatch(addToast({ type: 'warning', message: 'Please enter an email address for testing.' }));
      return;
    }
    setIsSendingTest(true);
    try {
      await mailApi.sendTestEmail(testEmailAddress.trim());
      dispatch(addToast({
        type: 'success',
        message: `✉️ Test email dispatched to ${testEmailAddress}!`,
      }));
      fetchEmailLogs();
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        message: err.message || 'Failed to dispatch test email',
      }));
    } finally {
      setIsSendingTest(false);
    }
  };

  const displayedNotifications = notifications.filter((n) =>
    filter === 'UNREAD' ? !n.is_read : true
  );

  const handleMarkRead = async (id: string) => {
    await dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
    dispatch(addToast({ type: 'success', message: 'All notifications marked as read' }));
  };

  return (
    <div className="space-y-6 w-full animate-fade-in pb-12">
      {/* Header Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-[#051747] tracking-tight">
            Communications & Alert Center
          </h1>
        </div>

        {/* Top View Selector: In-App Alerts vs Email Outbox */}
        <div className="flex items-center p-1 rounded-xl bg-white border border-[rgba(5,23,71,0.08)] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('IN_APP')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'IN_APP'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[#535F80] hover:text-[#051747]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>In-App Alerts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
              {notifications.filter((n) => !n.is_read).length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('EMAIL_OUTBOX');
              fetchEmailLogs();
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'EMAIL_OUTBOX'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[#535F80] hover:text-[#051747]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Outbox</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
              {emailLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: IN-APP NOTIFICATIONS ────────────────────────────────────────── */}
      {activeTab === 'IN_APP' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex p-0.5 rounded-lg bg-white border border-[rgba(5,23,71,0.08)]">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === 'ALL'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-[#535F80] hover:text-[#051747]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === 'UNREAD'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-[#535F80] hover:text-[#051747]'
                }`}
              >
                Unread
              </button>
            </div>

            <button
              onClick={handleMarkAllRead}
              className="btn-secondary text-xs !py-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All Read</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-14 bg-white border border-[rgba(5,23,71,0.08)] rounded-xl">
              <Spinner size="lg" />
              <span className="text-xs text-[#535F80] font-medium mt-3 uppercase tracking-wider">
                Fetching system notifications...
              </span>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <EmptyState
              title={filter === 'UNREAD' ? 'No unread notifications' : 'Notification log is clear'}
              description="You are caught up with all order dispatches, stock thresholds, and system events."
              icon={<Bell className="w-6 h-6 text-indigo-400" />}
            />
          ) : (
            <div className="space-y-2.5">
              {displayedNotifications.map((n) => {
                const isUnread = !n.is_read;
                return (
                  <div
                    key={n.id}
                    onClick={() => isUnread && handleMarkRead(n.id)}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isUnread
                        ? 'surface-card border-indigo-500/40 shadow-sm cursor-pointer hover:border-indigo-400'
                        : 'bg-white border-[rgba(5,23,71,0.08)] text-[#535F80] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        n.type === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : n.type === 'ERROR'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : n.type === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {n.type === 'WARNING' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : n.type === 'ERROR' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : n.type === 'SUCCESS' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isUnread ? 'text-white' : 'text-[#535F80]'
                          }`}
                        >
                          {n.title}
                        </h4>
                        <span className="text-[11px] text-[#535F80] flex items-center gap-1 shrink-0 ml-2">
                          <Clock className="w-3 h-3" />
                          {new Date(n.createdAt || n.created_at || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[#535F80] leading-relaxed">{n.message}</p>
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 self-center" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: EMAIL OUTBOX & DISPATCHES ───────────────────────────────────── */}
      {activeTab === 'EMAIL_OUTBOX' && (
        <div className="space-y-5">
          {/* Quick SMTP Test Email Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Test Email Dispatcher & Diagnostics</span>
              </h3>
              <p className="text-[11px] text-[#535F80]">
                Trigger an instant test email to verify SMTP transport and Ethereal preview delivery.
              </p>
            </div>

            <form onSubmit={handleSendTestEmail} noValidate className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="recipient@example.com"
                className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(5,23,71,0.08)] text-xs text-[#051747] focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[200px]"
              />
              <button
                type="submit"
                disabled={isSendingTest}
                className="btn-primary text-xs !py-1.5 shrink-0 flex items-center gap-1"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Send Test</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Outbox Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#535F80] uppercase tracking-wider">
                Outbound Message Logs ({emailLogs.length} total)
              </h3>
              <button
                onClick={fetchEmailLogs}
                disabled={loadingEmails}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEmails ? 'animate-spin' : ''}`} />
                <span>Refresh Outbox</span>
              </button>
            </div>

            {loadingEmails ? (
              <div className="flex flex-col items-center justify-center p-14 bg-white border border-[rgba(5,23,71,0.08)] rounded-xl">
                <Spinner size="lg" />
                <span className="text-xs text-[#535F80] font-medium mt-3 uppercase tracking-wider">
                  Loading email dispatch logs...
                </span>
              </div>
            ) : emailLogs.length === 0 ? (
              <EmptyState
                title="No emails dispatched yet"
                description="Outgoing invitations, order notifications, and test emails will be logged here."
                icon={<Mail className="w-6 h-6 text-indigo-400" />}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-white">
                        <th className="py-4 px-4 font-semibold">Recipient</th>
                        <th className="py-4 px-4 font-semibold">Subject & Purpose</th>
                        <th className="py-4 px-4 font-semibold">Type</th>
                        <th className="py-4 px-4 font-semibold">Delivery Status</th>
                        <th className="py-4 px-4 font-semibold">Dispatched At</th>
                        <th className="py-4 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {emailLogs.map((mail) => (
                        <tr key={mail.id} className="border-b border-slate-100/80 last:border-none hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-800 font-mono text-xs">{mail.to}</td>
                          <td className="py-4 px-4 max-w-[260px]">
                            <span className="font-medium text-slate-700 block truncate">{mail.subject}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                mail.templateType === 'INVITATION'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                  : mail.templateType === 'ORDER_NOTIFICATION'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : mail.templateType === 'TEST'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              }`}
                            >
                              {mail.templateType}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                mail.status === 'SENT'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  mail.status === 'SENT' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              {mail.status === 'SENT' ? 'Sent / Delivered' : 'Failed'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-500 text-xs">
                            {new Date(mail.sentAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                            {mail.html && (
                              <button
                                onClick={() => setPreviewingEmail(mail)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                                title="Preview Rendered HTML Email"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Preview</span>
                              </button>
                            )}
                            {mail.previewUrl && mail.previewUrl.startsWith('http') && (
                              <a
                                href={mail.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors inline-flex items-center gap-1.5 border border-indigo-200"
                                title="Open Ethereal Webview"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Webview</span>
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rendered HTML Email Preview Modal */}
      {previewingEmail && (
        <Modal
          isOpen={Boolean(previewingEmail)}
          onClose={() => setPreviewingEmail(null)}
          title={`Email Preview: ${previewingEmail.subject}`}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-white border border-[rgba(5,23,71,0.08)] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#535F80]">Recipient:</span>
                <span className="text-white font-mono font-semibold">{previewingEmail.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#535F80]">Subject:</span>
                <span className="text-white font-semibold">{previewingEmail.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#535F80]">Sent At:</span>
                <span className="text-[#535F80] font-mono">{new Date(previewingEmail.sentAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Embedded Email HTML Render */}
            <div className="border border-[rgba(5,23,71,0.08)] rounded-xl overflow-hidden bg-[#0b0f17] max-h-[460px] overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{ __html: previewingEmail.html || '<p>No content</p>' }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {previewingEmail.previewUrl && previewingEmail.previewUrl.startsWith('http') && (
                <a
                  href={previewingEmail.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in External Webview</span>
                </a>
              )}
              <button
                onClick={() => setPreviewingEmail(null)}
                className="btn-primary text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
