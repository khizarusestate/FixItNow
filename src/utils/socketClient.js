/**
 * FILE: frontend/src/utils/socketClient.js
 * 
 * Properly configured Socket.io client with:
 * - Error handling and logging
 * - Message queueing when offline
 * - Fallback to polling
 * - Browser notifications
 */

import io from 'socket.io-client';
import { SOCKET_URL as ENV_SOCKET_URL, API_ORIGIN } from '../config/env.js';

const SOCKET_URL = ENV_SOCKET_URL || import.meta.env.VITE_SOCKET_URL || API_ORIGIN || 'http://localhost:3000';
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

class SocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.listeners = {};
    this.messageQueue = [];
  }

  connect(userId) {
    if (this.socket?.connected) {
      console.log('✓ Socket already connected');
      return;
    }

    try {
      console.log(`🔌 Connecting to socket: ${SOCKET_URL}`);

      this.socket = io(SOCKET_URL, {
        auth: {
          userId: userId,
        },
        reconnection: true,
        reconnectionDelay: RECONNECT_DELAY,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        transports: ['websocket', 'polling'],
      });

      this.setupEventListeners();

    } catch (error) {
      console.error('❌ Socket connection failed:', error);
      this.handleConnectionError(error);
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Socket connected successfully');
      console.log(`   Socket ID: ${this.socket.id}`);
      this.processMessageQueue();
      this.emit('socket:connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.warn('⚠️  Socket disconnected');
      this.emit('socket:disconnected');
    });

    this.socket.on('reconnecting', (attempt) => {
      this.reconnectAttempts = attempt;
      console.log(`🔄 Reconnecting... (${attempt}/${MAX_RECONNECT_ATTEMPTS})`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      this.enableNotificationPolling();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.handleConnectionError(error);
    });

    this.socket.on('notification', (data) => {
      console.log('📨 Notification received:', data);
      this.emit('notification', data);
      this.showBrowserNotification(data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  emit(eventName, data = {}) {
    if (!this.socket?.connected) {
      console.warn(`⚠️  Socket not connected. Queueing: ${eventName}`);
      this.messageQueue.push({ eventName, data });
      return;
    }

    try {
      this.socket.emit(eventName, data);
      console.log(`📤 Event sent: ${eventName}`);
    } catch (error) {
      console.error(`❌ Failed to emit ${eventName}:`, error);
    }
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);

    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  processMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`📨 Processing ${this.messageQueue.length} queued messages`);
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach(({ eventName, data }) => {
      this.emit(eventName, data);
    });
  }

  enableNotificationPolling() {
    console.log('📡 Enabling notification polling (websocket fallback)');

    setInterval(async () => {
      try {
        const response = await fetch(`${SOCKET_URL}/api/notifications/unread`);
        const { notifications } = await response.json();

        notifications?.forEach(notification => {
          this.emit('notification', notification);
          this.showBrowserNotification(notification);
        });
      } catch (error) {
        console.warn('Polling failed:', error.message);
      }
    }, 30000);
  }

  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
      });
    }
  }

  handleConnectionError(error) {
    const msg = error?.message || 'Unknown error';
    console.error(`Connection error: ${msg}`);

    if (msg.includes('CORS')) {
      console.error('🔴 CORS Error - Check CLIENT_ORIGINS in backend .env');
    } else if (msg.includes('refused')) {
      console.error('🔴 Connection Refused - Check if backend is running');
    } else if (msg.includes('timeout')) {
      console.error('🔴 Connection Timeout - Check VPS firewall');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
      console.log('🔌 Socket disconnected');
    }
  }

  isConnected() {
    return this.connected;
  }

  getStatus() {
    return {
      connected: this.connected,
      socketId: this.socket?.id,
      queuedMessages: this.messageQueue.length,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

export default new SocketClient();
