import { useRef, useEffect } from 'react';
import { SignOut } from '@phosphor-icons/react';
import styles from './UserMenu.module.scss';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserMenu = ({ isOpen, onClose, onLogout }: UserMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.menu} ref={menuRef}>
      <button
        className={styles.item}
        onClick={() => {
          onLogout();
          onClose();
        }}
      >
        <SignOut size={20} weight="bold" />
        <span>Выйти</span>
      </button>
    </div>
  );
};
