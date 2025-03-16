'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr' | 'de';
type NotificationPreference = {
  email: boolean;
  push: boolean;
  marketing: boolean;
};

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('system');
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<NotificationPreference>({
    email: true,
    push: true,
    marketing: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    // Here you would implement the actual theme change logic
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Here you would implement the actual language change logic
  };

  const handleNotificationChange = (key: keyof NotificationPreference) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Here you would implement the actual settings save logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
    setSuccess('Settings saved successfully');
    setIsLoading(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your app experience
          </p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm"
          >
            {success}
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Appearance */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Appearance</h2>
            <div className="grid grid-cols-3 gap-4">
              {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`p-4 rounded-lg border ${
                    theme === t
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } transition-colors`}
                >
                  <div className="text-sm font-medium capitalize">{t}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Language</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Español' },
                { code: 'fr', name: 'Français' },
                { code: 'de', name: 'Deutsch' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as Language)}
                  className={`p-4 rounded-lg border ${
                    language === lang.code
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } transition-colors`}
                >
                  <div className="text-sm font-medium">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive email updates about your account
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('push')}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    notifications.push ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Marketing emails</div>
                  <div className="text-sm text-muted-foreground">
                    Receive emails about new features and updates
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('marketing')}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    notifications.marketing ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                      notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving changes...
              </span>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
