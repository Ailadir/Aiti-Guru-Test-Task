import { Trash } from "@phosphor-icons/react";
import { useCartStore } from "../../store/useCartStore";
import styles from "./CartDropdown.module.scss";

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDropdown = ({ isOpen, onClose }: CartDropdownProps) => {
  const { items, removeItem, clearCart } = useCartStore();

  if (!isOpen) return null;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dropdown}>
        <div className={styles.header}>
          <h3 className={styles.title}>Корзина ({items.length})</h3>
          {items.length > 0 && (
            <button className={styles.clearBtn} onClick={clearCart}>
              Очистить
            </button>
          )}
        </div>

        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>Корзина пустая</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div
                  className={styles.image}
                  style={{
                    backgroundImage: item.image
                      ? `url(${item.image})`
                      : undefined,
                    backgroundColor: item.image ? "transparent" : "#C4C4C4",
                  }}
                />
                <div className={styles.info}>
                  <div className={styles.name}>{item.name}</div>
                  <div className={styles.price}>
                    {item.quantity} × {item.price.toFixed(2)} ₽
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash size={18} color="#F11010" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Итого:</span>
              <span className={styles.totalPrice}>{total.toFixed(2)} ₽</span>
            </div>
            <button className={styles.checkoutBtn}>Оформить заказ</button>
          </div>
        )}
      </div>
    </>
  );
};
