import { useRef, useEffect } from "react";
import { CaretUp, CaretDown } from "@phosphor-icons/react";
import styles from "./SortMenu.module.scss";

interface SortMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: { field: string | null; direction: "asc" | "desc" };
  onSort: (field: string) => void;
}

export const SortMenu = ({
  isOpen,
  onClose,
  currentSort,
  onSort,
}: SortMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sortOptions = [
    { field: "name", label: "Наименование" },
    { field: "vendor", label: "Вендор" },
    { field: "article", label: "Артикул" },
    { field: "rating", label: "Оценка" },
    { field: "price", label: "Цена" },
    { field: "stock", label: "Количество" },
  ];

  return (
    <div className={styles.menu} ref={menuRef}>
      <div className={styles.header}>Сортировать по:</div>
      {sortOptions.map((option) => (
        <button
          key={option.field}
          className={`${styles.item} ${currentSort.field === option.field ? styles.active : ""}`}
          onClick={() => {
            onSort(option.field);
            onClose();
          }}
        >
          <span>{option.label}</span>
          {currentSort.field === option.field &&
            (currentSort.direction === "asc" ? (
              <CaretUp size={16} weight="bold" />
            ) : (
              <CaretDown size={16} weight="bold" />
            ))}
        </button>
      ))}
    </div>
  );
};
