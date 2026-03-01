
import React from 'react';
import { SearchBar } from '../molecules/SearchBar';
import { ProfileBadge } from '../molecules/ProfileBadge';
import { UserSettings } from '../../types';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    userSettings: UserSettings;
    onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    searchQuery,
    onSearchChange,
    userSettings,
    onProfileClick
}) => {
    return (
        <header className="h-24 px-8 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
            <SearchBar value={searchQuery} onChange={onSearchChange} />
            <ProfileBadge
                name={userSettings.userName}
                avatarUrl={userSettings.avatarUrl}
                onClick={onProfileClick}
            />
        </header>
    );
};
