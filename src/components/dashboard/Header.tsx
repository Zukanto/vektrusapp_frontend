import React, { useState } from 'react';
import { Bell, Search, ChevronDown, User, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { signOut, userProfile, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = userProfile?.first_name || user?.first_name || 'User';
  const displayEmail = userProfile?.email || user?.email || '';
  const fullName = userProfile?.last_name
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : displayName;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const demoNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Post erfolgreich veröffentlicht',
      message: 'Dein Instagram-Post wurde soeben veröffentlicht.',
      time: 'Vor 5 Minuten',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Neuer Kommentar',
      message: 'Lisa hat deinen LinkedIn-Post kommentiert.',
      time: 'Vor 1 Stunde',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Content-Plan läuft aus',
      message: 'Nur noch 3 Posts für diese Woche geplant.',
      time: 'Vor 2 Stunden',
      read: true
    }
  ];

  return (
    <>
      <div className="bg-[#49B7E3] text-white py-2 px-6 text-center text-sm">
        <span className="font-semibold">Demo-Modus aktiv</span>
        <span className="mx-2">•</span>
        <span>Alle Daten sind Beispieldaten zur Demonstration</span>
        <span className="mx-2">•</span>
        <span>Teste alle Features unverbindlich</span>
      </div>
      <header className="bg-white border-b border-[rgba(73,183,227,0.18)] px-6 py-4">
        <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
            <input
              type="text"
              placeholder="Suchen..."
              className="w-full pl-10 pr-4 py-2 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#49B7E3] focus:border-[#49B7E3] transition-all"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FA7E70] rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-[rgba(73,183,227,0.18)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#111111]">Benachrichtigungen</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {demoNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-[rgba(73,183,227,0.10)] hover:bg-[#F4FCFE] transition-colors cursor-pointer ${
                        !notification.read ? 'bg-[#B6EBF7]/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notification.type === 'success'
                              ? 'bg-[#49D69E]'
                              : notification.type === 'warning'
                              ? 'bg-[#F4BE9D]'
                              : 'bg-[#49B7E3]'
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111111] mb-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-[#7A7A7A] mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[#7A7A7A]">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-[rgba(73,183,227,0.18)]">
                  <button className="w-full text-center text-sm font-medium text-[#49B7E3] hover:text-[#3a9fd1] transition-colors">
                    Alle anzeigen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative group">
            <div className="flex items-center space-x-3 px-3 py-2 hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-[#49D69E] to-[#49B7E3] rounded-full flex items-center justify-center">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt={fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-sm font-semibold">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-[#111111]">{fullName}</p>
              <p className="text-xs text-[#7A7A7A]">{displayEmail}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#7A7A7A]" />
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
                >
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </header>
    </>
  );
};

export default Header;