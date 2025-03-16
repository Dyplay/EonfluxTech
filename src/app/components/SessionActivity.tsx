'use client';

import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';
import Image from 'next/image';
import { 
  FaChrome, 
  FaFirefox, 
  FaSafari, 
  FaEdge, 
  FaGlobe,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaOpera
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface EnhancedSession extends Omit<Models.Session, 'current'> {
  current: boolean;
  city?: string;
}

interface BrowserInfo {
  icon: IconType;
  name: string;
}

const getBrowserInfo = (session: EnhancedSession): BrowserInfo => {
  const clientName = session.clientName?.toLowerCase() || '';
  const clientType = session.clientType?.toLowerCase() || '';

  if (clientName.includes('chrome')) {
    return { icon: FaChrome, name: 'Chrome' };
  } else if (clientName.includes('firefox')) {
    return { icon: FaFirefox, name: 'Firefox' };
  } else if (clientName.includes('safari')) {
    return { icon: FaSafari, name: 'Safari' };
  } else if (clientName.includes('edge')) {
    return { icon: FaEdge, name: 'Edge' };
  } else if (clientName.includes('opera')) {
    return { icon: FaOpera, name: 'Opera' };
  }
  
  return { icon: FaGlobe, name: clientType || 'Unknown Browser' };
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-input hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SessionActivity() {
  const [sessions, setSessions] = useState<EnhancedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagErrors, setFlagErrors] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    sessionId?: string;
  }>({ isOpen: false });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current session first
      const currentSession = await account.getSession('current');
      
      // Get all sessions
      const response = await account.listSessions();
      console.log('Sessions data:', response);

      // Map and sort sessions
      const enhancedSessions = response.sessions
        .map(session => ({
          ...session,
          current: session.$id === currentSession.$id
        }))
        .sort((a, b) => {
          // Current session always first
          if (a.current) return -1;
          if (b.current) return 1;
          // Then sort by creation date (newest first)
          return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
        });

      setSessions(enhancedSessions);
    } catch (err: any) {
      console.error('Error loading sessions:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (sessionId: string) => {
    try {
      await account.deleteSession(sessionId);
      await loadSessions(); // Reload sessions after logout
    } catch (err: any) {
      console.error('Error logging out session:', err);
      setError(err.message || 'Failed to logout session');
    }
  };

  const handleFlagError = (countryCode: string) => {
    setFlagErrors(prev => new Set([...prev, countryCode]));
  };

  const formatSessionInfo = (session: EnhancedSession) => {
    const browser = getBrowserInfo(session);
    const details = [];

    // Add browser info
    details.push(`${browser.name}${session.clientVersion ? ` ${session.clientVersion}` : ''}`);

    // Add device info if available
    if (session.deviceName || session.deviceModel || session.deviceBrand) {
      const deviceInfo = [session.deviceBrand, session.deviceModel, session.deviceName]
        .filter(Boolean)
        .join(' ');
      if (deviceInfo) details.push(deviceInfo);
    }

    // Add OS info if available
    if (session.osName || session.osVersion) {
      const osInfo = [session.osName, session.osVersion]
        .filter(Boolean)
        .join(' ');
      if (osInfo) details.push(osInfo);
    }

    return details.join(' • ');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Session Activity</h2>
        <p className="text-muted-foreground">
          Manage your active sessions across different devices
        </p>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const browser = getBrowserInfo(session);
          const Icon = browser.icon;
          const countryCode = session.countryCode?.toLowerCase();

          return (
            <motion.div
              key={session.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                session.current ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium flex items-center">
                        {formatSessionInfo(session)}
                        {session.current && (
                          <span className="ml-2 text-xs text-primary-foreground bg-primary px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        IP: {session.ip || 'Unknown IP'}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      {countryCode ? (
                        <div className="flex items-center">
                          <div className="relative h-3.5 w-3.5 mr-2 shadow-sm rounded overflow-hidden">
                            <Image
                              src={`https://flagcdn.com/w40/${countryCode}.png`}
                              alt={session.countryName || 'Country flag'}
                              fill
                              className="object-cover"
                              sizes="20px"
                              priority
                              onError={() => handleFlagError(countryCode)}
                            />
                          </div>
                          <span>
                            {session.countryName}
                            {session.city && `, ${session.city}`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="w-3.5 h-3.5 mr-2" />
                          Unknown Location
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span>Last active: {new Date(session.$createdAt).toLocaleString()}</span>
                      {session.provider && (
                        <span className="ml-2 px-1.5 py-0.5 bg-muted rounded text-[10px]">
                          via {session.provider}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!session.current && (
                  <button
                    onClick={() => {
                      setConfirmDialog({ isOpen: true, sessionId: session.$id });
                    }}
                    className="flex items-center space-x-1 text-sm text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.sessionId) {
            handleLogout(confirmDialog.sessionId);
          }
        }}
        title="Confirm Logout"
        message="Are you sure you want to log out this session? This action cannot be undone."
      />
    </div>
  );
} 