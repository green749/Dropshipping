import { io, Socket } from 'socket.io-client';
import type { ChatMessageItem } from '../api/chatApi';

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private currentBusinessId: string | null = null;

  public connect(token: string, initialBusinessId?: string): Socket | null {
    if (!token) {
      this.disconnect();
      return null;
    }

    if (initialBusinessId) {
      this.currentBusinessId = initialBusinessId;
    }

    // If already connecting or connected with the EXACT SAME token, return existing socket
    if (this.socket && this.currentToken === token) {
      if (this.socket.disconnected) {
        this.socket.connect();
      }
      if (initialBusinessId) {
        this.joinBusiness(initialBusinessId);
      }
      return this.socket;
    }

    // If token changed or socket exists, disconnect and recreate
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = token;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_WS_URL ||
      (typeof window !== 'undefined'
        ? window.location.origin.includes('5173') ||
          window.location.origin.includes('5174') ||
          window.location.origin.includes('5175') ||
          window.location.origin.includes('3000')
          ? 'http://localhost:5000'
          : window.location.origin
        : 'http://localhost:5000');

    console.log('⚡ [WebSocket] Initiating connection to:', socketUrl);

    this.socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('⚡ [WebSocket] Connected successfully. Socket ID:', this.socket?.id);
      if (this.currentBusinessId && this.currentBusinessId !== 'all') {
        this.joinBusiness(this.currentBusinessId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 [WebSocket] Disconnected from Chat Server:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('⚠️ [WebSocket] Connection Error:', err.message);
    });

    return this.socket;
  }

  public joinBusiness(businessId: string) {
    this.currentBusinessId = businessId;
    if (this.socket && this.socket.connected && businessId && businessId !== 'all') {
      this.socket.emit('join_business', { businessId });
    }
  }

  public leaveBusiness(businessId: string) {
    if (this.socket && this.socket.connected && businessId && businessId !== 'all') {
      this.socket.emit('leave_business', { businessId });
    }
    if (this.currentBusinessId === businessId) {
      this.currentBusinessId = null;
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
      this.currentBusinessId = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return Boolean(this.socket && this.socket.connected);
  }

  public sendMessage(
    data: { receiverId: string; content: string; attachmentUrl?: string; businessId?: string },
    callback?: (res: { success?: boolean; message?: ChatMessageItem; error?: string }) => void
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', data, callback);
    } else if (callback) {
      callback({ error: 'WebSocket not connected' });
    }
  }

  public sendBroadcast(
    data: { content: string; targetRole?: string; attachmentUrl?: string; businessId?: string },
    callback?: (res: { success?: boolean; broadcast?: ChatMessageItem; error?: string }) => void
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_broadcast', data, callback);
    } else if (callback) {
      callback({ error: 'WebSocket not connected' });
    }
  }

  public emitTyping(receiverId: string, isTyping: boolean, businessId?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', { receiverId, isTyping, businessId });
    }
  }

  public markRead(partnerId: string, businessId?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('mark_read', { partnerId, businessId });
    }
  }
}

export const socketService = new SocketService();
