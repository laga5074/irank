import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Friend } from './types';
import { ALL_FRIENDS, MAX_SELECTED_FRIENDS, ROTATION_INTERVAL_MS } from './constants';

// --- Helper to get/set localStorage values ---
const useLocalStorage = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, value]);

    return [value, setValue];
};


// --- UI Components ---

const FriendsList: React.FC<{
    selectedFriendIds: number[];
    onSelectFriend: (friendId: number) => void;
}> = ({ selectedFriendIds, onSelectFriend }) => {
    const isSelectionDisabled = selectedFriendIds.length >= MAX_SELECTED_FRIENDS;

    return (
        <section className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-green-400">Friends List</h2>
            <p className="text-sm text-gray-400 mb-4">Select up to {MAX_SELECTED_FRIENDS} friends for auto-host rotation.</p>
            <div className="space-y-3">
                {ALL_FRIENDS.map(friend => {
                    const isSelected = selectedFriendIds.includes(friend.id);
                    const isDisabled = !isSelected && isSelectionDisabled;
                    return (
                        <label
                            key={friend.id}
                            className={`flex items-center p-3 rounded-md transition-colors duration-200 cursor-pointer ${
                                isSelected ? 'bg-green-500/20' : 'bg-gray-700 hover:bg-gray-600'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => onSelectFriend(friend.id)}
                                className="h-5 w-5 rounded border-gray-500 text-green-500 focus:ring-green-500/50 bg-gray-600 accent-green-500"
                            />
                            <img src={friend.avatarUrl} alt={friend.name} className="h-10 w-10 rounded-full mx-4" />
                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{friend.name}</span>
                        </label>
                    );
                })}
            </div>
        </section>
    );
};

const AutoHostDisplay: React.FC<{
    selectedFriends: Friend[];
    currentlyHostedId: number | null;
    progress: number;
}> = ({ selectedFriends, currentlyHostedId, progress }) => {
    if (selectedFriends.length === 0) {
        return (
            <section className="bg-gray-800 rounded-lg p-8 shadow-lg h-full flex flex-col items-center justify-center text-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.176-5.97m0 0A11.953 11.953 0 0112 10c4.545 0 8.416 2.368 10.548 5.972" /></svg>
                <h2 className="text-xl font-bold mb-2 text-gray-400">No Friends Selected</h2>
                <p className="text-gray-500">Select friends from the list to begin auto-hosting.</p>
            </section>
        );
    }
    
    return (
        <section className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-green-400">Auto-Host Rotation</h2>
            <div className="space-y-4">
                {selectedFriends.map(friend => {
                    const isHosted = friend.id === currentlyHostedId;
                    return (
                        <div key={friend.id} className={`p-4 rounded-lg transition-all duration-300 ${isHosted ? 'bg-green-500/20 ring-2 ring-green-400 scale-105' : 'bg-gray-700'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img src={friend.avatarUrl} alt={friend.name} className={`h-12 w-12 rounded-full transition-all duration-300 ${isHosted ? 'ring-2 ring-green-300' : 'ring-2 ring-gray-500'}`} />
                                    <div className="ml-4">
                                        <p className={`font-bold ${isHosted ? 'text-green-300' : 'text-white'}`}>{friend.name}</p>
                                        <p className="text-sm text-gray-400">{isHosted ? 'Currently Hosting' : 'In Rotation'}</p>
                                    </div>
                                </div>
                                {isHosted && <div className="text-xs font-mono text-green-300">LIVE</div>}
                            </div>
                            {isHosted && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                                        <div
                                            className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 linear"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const Settings: React.FC<{
    notificationDelay: number;
    onDelayChange: (delay: number) => void;
    webhookUrl: string;
    onWebhookUrlChange: (url: string) => void;
    onReset: () => void;
}> = ({ notificationDelay, onDelayChange, webhookUrl, onWebhookUrlChange, onReset }) => {
    return (
        <section className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-green-400">Settings</h2>
            <div className="mb-6 space-y-4">
                <div>
                    <label htmlFor="notification-delay" className="block text-sm font-medium text-gray-300 mb-2">Notify when friend goes live</label>
                    <select
                        id="notification-delay"
                        value={notificationDelay}
                        onChange={(e) => onDelayChange(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value={0}>Off</option>
                        <option value={1}>Every 1 Hour</option>
                        <option value={2}>Every 2 Hours</option>
                    </select>
                </div>
                <div>
                     <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-300 mb-2">Webhook URL (Optional)</label>
                     <input
                        type="text"
                        id="webhook-url"
                        placeholder="https://your-webhook-url.com"
                        value={webhookUrl}
                        onChange={(e) => onWebhookUrlChange(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                     />
                </div>
            </div>
            <button
                onClick={onReset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
                Reset All Settings
            </button>
        </section>
    );
};

const About: React.FC = () => (
    <section className="text-center text-sm text-gray-500">
        <p>Kick AutoHoster for Kick Developer Bounty Program 2025 — simulate auto-hosting friends without login. Fully frontend, deploy-ready for Netlify.</p>
    </section>
);


// --- Page Components ---

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
            <header className="mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    <span className="text-white">Kick</span>
                    <span className="text-green-400"> AutoHoster</span>
                </h1>
                <p className="mt-2 text-lg text-gray-400">A simulation for the Kick Developer Bounty 2025</p>
            </header>
            <main>
                <p className="text-gray-400 mb-6">
                    Log in with your Kick account to continue. This is a simulation and no real data will be used.
                </p>
                <button
                    onClick={onLogin}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 text-lg flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" role="img" aria-label="Kick logo" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12.44 2.996L3.32 12.115l3.684 3.684L9.117 18l2.113 2.113 3.685 3.684 3.684-3.684-1.408-1.408-2.276-2.276-2.113-2.113-2.113 2.113 2.113 2.113 1.408 1.408 2.276 2.276-2.276-2.276-1.408-1.408-2.113-2.113V12.115l2.113-2.113 2.276-2.276 1.408-1.408 2.276-2.276z"/>
                    </svg>
                    <span>Login with Kick</span>
                </button>
            </main>
             <footer className="mt-8 pt-6 border-t border-gray-700">
                 <p className="text-center text-xs text-gray-500">
                    By logging in, you agree that this is a simulated environment.
                </p>
            </footer>
        </div>
    </div>
);

const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [selectedFriendIds, setSelectedFriendIds] = useLocalStorage<number[]>('selectedFriendIds', []);
    const [notificationDelay, setNotificationDelay] = useLocalStorage<number>('notificationDelay', 1);
    const [webhookUrl, setWebhookUrl] = useLocalStorage<string>('webhookUrl', '');
    const [lastNotificationTime, setLastNotificationTime] = useLocalStorage<number>('lastNotificationTime', 0);
    
    const [currentlyHostedIndex, setCurrentlyHostedIndex] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState(ROTATION_INTERVAL_MS);

    const selectedFriends = useMemo(() => ALL_FRIENDS.filter(f => selectedFriendIds.includes(f.id)), [selectedFriendIds]);
    const currentlyHostedId = selectedFriends.length > 0 ? selectedFriends[currentlyHostedIndex]?.id : null;

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const showNotification = useCallback((friendName: string) => {
        if (!('Notification' in window) || Notification.permission !== 'granted' || notificationDelay === 0) {
            return;
        }

        const now = Date.now();
        const delayMs = notificationDelay * 60 * 60 * 1000;

        if (now - lastNotificationTime >= delayMs) {
            new Notification('Kick AutoHoster', {
                body: `You are now auto-hosting ${friendName}!`,
                icon: 'https://picsum.photos/seed/icon/192'
            });
            setLastNotificationTime(now);
        }
    }, [notificationDelay, lastNotificationTime, setLastNotificationTime]);
    
    useEffect(() => {
        if (selectedFriends.length === 0) {
            setTimeLeft(ROTATION_INTERVAL_MS);
            setCurrentlyHostedIndex(0);
            return;
        }
        
        // Ensure index is valid after selection change
        if(currentlyHostedIndex >= selectedFriends.length) {
            setCurrentlyHostedIndex(0);
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1000) {
                    const nextIndex = (currentlyHostedIndex + 1) % selectedFriends.length;
                    setCurrentlyHostedIndex(nextIndex);
                    showNotification(selectedFriends[nextIndex].name);
                    return ROTATION_INTERVAL_MS;
                }
                return prevTime - 1000;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [selectedFriends, currentlyHostedIndex, showNotification]);
    
    useEffect(() => {
        if (selectedFriends.length > 0 && selectedFriends[currentlyHostedIndex]) {
             showNotification(selectedFriends[currentlyHostedIndex].name);
        }
    }, [selectedFriendIds, showNotification]); // Runs only when friend selection changes

    const handleSelectFriend = (friendId: number) => {
        setSelectedFriendIds(prevIds => {
            let newIds;
            if (prevIds.includes(friendId)) {
                newIds = prevIds.filter(id => id !== friendId);
            } else if (prevIds.length < MAX_SELECTED_FRIENDS) {
                newIds = [...prevIds, friendId];
            } else {
                 return prevIds;
            }
            // Reset rotation state on change
            setCurrentlyHostedIndex(0);
            setTimeLeft(ROTATION_INTERVAL_MS);
            return newIds;
        });
    };

    const handleReset = () => {
        setSelectedFriendIds([]);
        setNotificationDelay(1);
        setWebhookUrl('');
        setLastNotificationTime(0);
        setCurrentlyHostedIndex(0);
        setTimeLeft(ROTATION_INTERVAL_MS);
    };
    
    const progress = (timeLeft / ROTATION_INTERVAL_MS) * 100;

    return (
        <div className="min-h-screen font-sans p-4 sm:p-6 md:p-8">
            <div className="container mx-auto max-w-6xl">
                <header className="flex justify-between items-center mb-10">
                     <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            <span className="text-white">Kick</span>
                            <span className="text-green-400"> AutoHoster</span>
                        </h1>
                        <div className="mt-1 text-md text-gray-400 flex items-center gap-2">
                           <img src="https://picsum.photos/seed/demouser/40" alt="DemoUser" className="h-8 w-8 rounded-full" />
                           <span>Welcome, <strong>DemoUser</strong>!</span>
                        </div>
                    </div>
                     <button
                        onClick={onLogout}
                        className="bg-gray-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        Logout
                    </button>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <FriendsList selectedFriendIds={selectedFriendIds} onSelectFriend={handleSelectFriend} />
                        <Settings
                            notificationDelay={notificationDelay}
                            onDelayChange={setNotificationDelay}
                            webhookUrl={webhookUrl}
                            onWebhookUrlChange={setWebhookUrl}
                            onReset={handleReset}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <AutoHostDisplay selectedFriends={selectedFriends} currentlyHostedId={currentlyHostedId} progress={100 - progress} />
                    </div>
                </main>
                
                <footer className="mt-12 pt-8 border-t border-gray-700">
                    <About />
                </footer>
            </div>
        </div>
    );
};


// --- App Component (Authentication Router) ---
export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>('isLoggedIn', false);

    const handleLogin = () => setIsLoggedIn(true);

    const handleLogout = () => {
        // Clear all app data for a clean logout
        window.localStorage.clear();
        setIsLoggedIn(false);
    };
    
    return (
        <>
            {isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
        </>
    );
}
