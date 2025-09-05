import { Child, SessionSummary, Doctor } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

export class StorageService {
  static getChildren(): Child[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHILDREN);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting children from storage:', error);
      return [];
    }
  }

  static saveChildren(children: Child[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
    } catch (error) {
      console.error('Error saving children to storage:', error);
    }
  }

  static addChild(child: Child): void {
    const children = this.getChildren();
    children.push(child);
    this.saveChildren(children);
  }

  static updateChild(childId: string, updates: Partial<Child>): void {
    const children = this.getChildren();
    const index = children.findIndex(c => c.id === childId);
    if (index !== -1) {
      children[index] = { ...children[index], ...updates };
      this.saveChildren(children);
    }
  }

  static deleteChild(childId: string): void {
    const children = this.getChildren().filter(c => c.id !== childId);
    this.saveChildren(children);
    
    // Also delete related sessions
    const sessions = this.getSessions().filter(s => s.childId !== childId);
    this.saveSessions(sessions);
  }

  static getChildById(childId: string): Child | null {
    const children = this.getChildren();
    return children.find(c => c.id === childId) || null;
  }

  static getSessions(): SessionSummary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sessions from storage:', error);
      return [];
    }
  }

  static saveSessions(sessions: SessionSummary[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions to storage:', error);
    }
  }

  static addSession(session: SessionSummary): void {
    const sessions = this.getSessions();
    sessions.push(session);
    this.saveSessions(sessions);
  }

  static getSessionById(sessionId: string): SessionSummary | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  static updateSession(sessionId: string, updates: Partial<SessionSummary>): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      this.saveSessions(sessions);
    }
  }

  static getSessionsForChild(childId: string): SessionSummary[] {
    return this.getSessions().filter(s => s.childId === childId);
  }

  static saveDoctor(doctor: Doctor): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCTOR, JSON.stringify(doctor));
    } catch (error) {
      console.error('Error saving doctor to storage:', error);
    }
  }

  static getDoctor(): Doctor | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTOR);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting doctor from storage:', error);
      return null;
    }
  }

  static clearDoctor(): void {
    localStorage.removeItem(STORAGE_KEYS.DOCTOR);
  }

  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}