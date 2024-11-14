'use client';

import { CalendarEvent } from '../types/calendar';

type WebSocketMessage = {
  type: 'event_update' | 'event_delete' | 'event_create' | 'notification';
  data: any;
};

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isEnabled: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && this.isEnabled) {
      this.connect();
    }
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  enableWebSocket(enable: boolean) {
    this.isEnabled = enable;
    if (enable && !this.ws) {
      this.connect();
    } else if (!enable && this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private connect() {
    try {
      this.ws = new WebSocket('ws://localhost:3001');

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifyListeners(message.type, message.data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket error - falling back to HTTP:', error);
        this.enableWebSocket(false);
      };
    } catch (error) {
      console.warn('Failed to establish WebSocket connection:', error);
      this.enableWebSocket(false);
    }
  }

  private handleReconnect() {
    if (!this.isEnabled) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(), delay);
    } else {
      console.warn('Max reconnection attempts reached, disabling WebSocket');
      this.enableWebSocket(false);
    }
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);

    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  private notifyListeners(type: string, data: any) {
    this.listeners.get(type)?.forEach(callback => callback(data));
  }

  private async fallbackHttpRequest(type: string, data?: any) {
    try {
      const endpoint = type.replace('event_', '');
      const response = await fetch(`/api/calendar/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('HTTP fallback request failed:', error);
      throw error;
    }
  }

  sendMessage(type: string, data: any) {
    if (this.isEnabled && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      return this.fallbackHttpRequest(type, data);
    }
  }

  updateEvent(event: CalendarEvent) {
    this.sendMessage('event_update', event);
  }

  deleteEvent(eventId: string) {
    this.sendMessage('event_delete', { id: eventId });
  }

  createEvent(event: CalendarEvent) {
    this.sendMessage('event_create', event);
  }
}

export default WebSocketService; 