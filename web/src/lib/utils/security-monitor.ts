/**
 * Security monitoring utilities for virtual care sessions
 */

interface SecurityEvent {
  type: string;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  details?: Record<string, any>;
}

interface SecurityStatus {
  isSecure: boolean;
  encryption: {
    enabled: boolean;
    strength: string;
  };
  network: {
    isStable: boolean;
    latency: number;
  };
  permissions: {
    camera: boolean;
    microphone: boolean;
    notifications: boolean;
  };
}

interface NetworkInformation {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private securityStatus: SecurityStatus = {
    isSecure: false,
    encryption: {
      enabled: false,
      strength: 'none'
    },
    network: {
      isStable: false,
      latency: 0
    },
    permissions: {
      camera: false,
      microphone: false,
      notifications: false
    }
  };

  private constructor() {
    this.initializeMonitor();
  }

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  private async initializeMonitor() {
    this.securityStatus.isSecure = window.location.protocol === 'https:';
    
    // Check encryption capabilities
    if (window.crypto && window.crypto.subtle) {
      this.securityStatus.encryption = {
        enabled: true,
        strength: 'AES-256-GCM'
      };
    }

    // Check network status
    this.checkNetworkStatus();

    // Check permissions
    await this.checkPermissions();
  }

  private async checkPermissions() {
    if (navigator.permissions) {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      const notificationPermission = await navigator.permissions.query({ name: 'notifications' as PermissionName });

      this.securityStatus.permissions = {
        camera: cameraPermission.state === 'granted',
        microphone: microphonePermission.state === 'granted',
        notifications: notificationPermission.state === 'granted'
      };
    }
  }

  private checkNetworkStatus() {
    if (navigator.connection) {
      const connection = navigator.connection;
      this.securityStatus.network.isStable = connection.type !== 'none' && connection.type !== 'cellular';
    }

    // Measure latency
    const start = performance.now();
    fetch('/api/health').then(() => {
      this.securityStatus.network.latency = performance.now() - start;
    }).catch(() => {
      this.securityStatus.network.isStable = false;
    });
  }

  public logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(securityEvent);

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('[SECURITY EVENT]', securityEvent);
    }

    // In production, you would send this to your security monitoring service
  }

  public getSecurityStatus(): SecurityStatus {
    return { ...this.securityStatus };
  }

  public async validateSession(sessionId: string): Promise<boolean> {
    // Add your session validation logic here
    return this.securityStatus.isSecure && this.securityStatus.encryption.enabled;
  }

  public getSecurityEvents(sessionId?: string): SecurityEvent[] {
    if (sessionId) {
      return this.events.filter(event => event.sessionId === sessionId);
    }
    return [...this.events];
  }

  public clearEvents() {
    this.events = [];
  }
}

export default SecurityMonitor.getInstance(); 