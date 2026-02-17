import { useState, useRef, useEffect } from "react";
import { DotsThreeCircle, Trash } from "@phosphor-icons/react";
import styles from "./OverflowMenu.module.scss";

interface OverflowMenuProps {
  onDelete: () => void;
}

export const OverflowMenu = ({ onDelete }: OverflowMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={menuRef}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <DotsThreeCircle size={32} color="#B2B3B9" />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <button className={styles.menuItem} onClick={handleDelete}>
            <Trash size={20} color="#F11010" />
            <span>Удалить</span>
          </button>
        </div>
      )}
    </div>
  );
};
