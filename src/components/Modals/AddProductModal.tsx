import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { productsApi } from "../../api/products";
import type { CreateProductRequest } from "../../api/products";
import { useProductsStore } from "../../store/useProductsStore";
import styles from "./AddProductModal.module.scss";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal = ({ isOpen, onClose }: AddProductModalProps) => {
  const [formData, setFormData] = useState<CreateProductRequest>({
    title: "",
    price: 0,
    brand: "",
    category: "",
    rating: 5,
    stock: 0,
  });

  const addLocalProduct = useProductsStore((state) => state.addLocalProduct);

  const createMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: (data) => {
      // Добавляем в локальное хранилище
      addLocalProduct(data);
      // Закрываем модалку
      onClose();
      // Очищаем форму
      setFormData({
        title: "",
        price: 0,
        brand: "",
        category: "",
        rating: 5,
        stock: 0,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Добавить новый товар</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} color="#232323" />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Наименование</label>
            <input
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Вендор</label>
            <input
              type="text"
              className={styles.input}
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Категория</label>
            <input
              type="text"
              className={styles.input}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Оценка</label>
              <input
                type="number"
                className={styles.input}
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Цена, ₽</label>
              <input
                type="number"
                className={styles.input}
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Количество</label>
            <input
              type="number"
              className={styles.input}
              min="0"
              step="1"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Добавление..." : "Добавить товар"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
