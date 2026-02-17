import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlass,
  ArrowsClockwise,
  PlusCircle,
  Plus,
  Globe,
  Bell,
  EnvelopeSimple,
  DotsNine,
  ShoppingCart,
  CaretUp,
  CaretDown,
  ArrowsDownUp,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../../api/products";
import type { Product } from "../../api/products";
import { useProductsStore } from "../../store/useProductsStore";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { AddProductModal } from "../Modals/AddProductModal";
import { OverflowMenu } from "../Common/OverflowMenu";
import { CartDropdown } from "../Common/CartDropdown";
import { SortMenu } from "../Common/SortMenu";
import { UserMenu } from "../Common/UserMenu";
import styles from "./ProductsTable.module.scss";

const SortIcon = ({
  field,
  sortField,
  sortDirection,
}: {
  field: string;
  sortField: string | null;
  sortDirection: "asc" | "desc";
}) => {
  if (sortField !== field) return null;
  return sortDirection === "asc" ? (
    <CaretUp size={16} weight="bold" />
  ) : (
    <CaretDown size={16} weight="bold" />
  );
};

export const ProductsTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 20;

  const navigate = useNavigate();
  const {
    localProducts,
    selectedProducts,
    excludedApiProducts,
    toggleProductSelection,
    selectAllProducts,
    deselectAllProducts,
    removeLocalProduct,
    clearLocalProducts,
    addExcludedProduct,
    clearExcludedProducts,
  } = useProductsStore();

  const { addItem, getTotalItems } = useCartStore();
  const cartItemsCount = getTotalItems();

  const logout = useAuthStore((state) => state.logout);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", currentPage, searchQuery],
    queryFn: () =>
      productsApi.getProducts({
        limit: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
        q: searchQuery || undefined,
      }),
  });

  const allProducts = useMemo(() => {
    // Фильтруем API товары: убираем исключенные и дополнительно фильтруем по названию
    const apiProducts = (data?.products || [])
      .filter((product) => !excludedApiProducts.includes(product.id))
      .filter((product) =>
        searchQuery
          ? product.title.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      );

    // Фильтруем локальные товары по поисковому запросу
    const filteredLocalProducts = searchQuery
      ? localProducts.filter((product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : localProducts;

    const combined = [...filteredLocalProducts, ...apiProducts];

    if (sortField) {
      combined.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case "name":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "vendor":
            aValue = (a.brand || "").toLowerCase();
            bValue = (b.brand || "").toLowerCase();
            break;
          case "article":
            aValue = a.id;
            bValue = b.id;
            break;
          case "rating":
            aValue = a.rating || 0;
            bValue = b.rating || 0;
            break;
          case "price":
            aValue = a.price;
            bValue = b.price;
            break;
          case "stock":
            aValue = a.stock || 0;
            bValue = b.stock || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return combined;
  }, [
    localProducts,
    data?.products,
    excludedApiProducts,
    sortField,
    sortDirection,
    searchQuery,
  ]);

  const totalPages = data ? Math.ceil(data.total / itemsPerPage) : 1;

  const handleSelectAll = () => {
    if (selectedProducts.length === allProducts.length) {
      deselectAllProducts();
    } else {
      selectAllProducts(allProducts.map((p) => p.id));
    }
  };

  const handleDelete = (id: number, isLocal: boolean) => {
    if (isLocal) {
      removeLocalProduct(id);
    } else {
      addExcludedProduct(id);
    }
  };

  const handleRefresh = () => {
    clearLocalProducts();
    clearExcludedProducts();
    refetch();
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.thumbnail,
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAllSelected =
    allProducts.length > 0 && selectedProducts.length === allProducts.length;

  const mapProduct = (product: Product) => ({
    id: product.id,
    name: product.title,
    category: product.category,
    vendor: product.brand || "N/A",
    article: `ART-${product.id}`,
    rating: product.rating || 0,
    price: product.price,
    stock: product.stock || 0,
    image: product.thumbnail,
  });

  const StockIndicator = ({ stock }: { stock: number }) => {
    const bars = Math.min(Math.ceil(stock / 30), 3); // 1-3 bars based on stock level
    return (
      <div className={styles.stockIndicator}>
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`${styles.stockBar} ${bar <= bars ? styles.stockBarActive : ""}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.navbar}>
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>Товары</h1>
          </div>

          <div className={styles.menu}>
            <div className={styles.search}>
              <MagnifyingGlass size={24} color="#999999" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className={styles.navIcons}>
            <div className={styles.divider} />
            <button className={styles.iconBtn}>
              <Globe size={24} color="#232323" />
            </button>
            <button className={styles.iconBtn}>
              <Bell size={24} color="#232323" />
              <span className={styles.badge}>12</span>
            </button>
            <button className={styles.iconBtn}>
              <EnvelopeSimple size={24} color="#232323" />
            </button>
            <div style={{ position: "relative" }}>
              <button
                className={styles.iconBtn}
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <ShoppingCart size={24} color="#232323" weight="bold" />
                {cartItemsCount > 0 && (
                  <span className={styles.badge}>{cartItemsCount}</span>
                )}
              </button>
              <CartDropdown
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
              />
            </div>
            <div style={{ position: "relative" }}>
              <button
                className={styles.iconBtn}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <DotsNine size={24} color="#232323" />
              </button>
              <UserMenu
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.main}>
            <div className={styles.allProductsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Все позиции</h2>

                <div className={styles.actions}>
                  <button className={styles.refreshBtn} onClick={handleRefresh}>
                    <ArrowsClockwise size={22} color="#515161" />
                  </button>

                  <div style={{ position: "relative" }}>
                    <button
                      className={styles.refreshBtn}
                      onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                      title="Сортировка"
                    >
                      <ArrowsDownUp size={22} color="#515161" />
                    </button>
                    <SortMenu
                      isOpen={isSortMenuOpen}
                      onClose={() => setIsSortMenuOpen(false)}
                      currentSort={{
                        field: sortField,
                        direction: sortDirection,
                      }}
                      onSort={handleSort}
                    />
                  </div>

                  <button
                    className={styles.addBtn}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <PlusCircle size={22} color="#FFFFFF" />
                    <span>Добавить</span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className={styles.loading}>Загрузка...</div>
              ) : (
                <>
                  <div className={styles.table}>
                    <div className={styles.tableHeader}>
                      <div className={styles.productColumn}>
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className={styles.checkbox}
                        />
                        <button
                          className={styles.sortButton}
                          onClick={() => handleSort("name")}
                        >
                          Наименование
                          <SortIcon
                            field="name"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </button>
                      </div>

                      <div className={styles.details}>
                        <button
                          className={styles.sortButton}
                          onClick={() => handleSort("vendor")}
                        >
                          Вендор
                          <SortIcon
                            field="vendor"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </button>
                        <button
                          className={styles.sortButton}
                          onClick={() => handleSort("article")}
                        >
                          Артикул
                          <SortIcon
                            field="article"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </button>
                        <button
                          className={styles.sortButton}
                          onClick={() => handleSort("rating")}
                        >
                          Оценка
                          <SortIcon
                            field="rating"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </button>
                        <button
                          className={styles.sortButton}
                          onClick={() => handleSort("price")}
                        >
                          Цена, ₽
                          <SortIcon
                            field="price"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </button>
                        <button
                          className={styles.sortButton}
                          onClick={() => handleSort("stock")}
                        >
                          Кол-во
                          <SortIcon
                            field="stock"
                            sortField={sortField}
                            sortDirection={sortDirection}
                          />
                        </button>
                        <span></span>
                      </div>
                    </div>

                    {allProducts.map((product) => {
                      const displayProduct = mapProduct(product);
                      const isSelected = selectedProducts.includes(product.id);
                      const isLocal = localProducts.some(
                        (p) => p.id === product.id,
                      );

                      return (
                        <div
                          key={product.id}
                          className={`${styles.row} ${isSelected ? styles.highlighted : ""}`}
                        >
                          {isSelected && (
                            <div className={styles.highlightBar} />
                          )}

                          <div className={styles.rowContent}>
                            <div className={styles.base}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  toggleProductSelection(product.id)
                                }
                                className={`${styles.checkbox} ${isSelected ? styles.checkboxHighlighted : ""}`}
                              />

                              <div
                                className={styles.photo}
                                style={{
                                  backgroundImage: displayProduct.image
                                    ? `url(${displayProduct.image})`
                                    : undefined,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              />

                              <div className={styles.nameBlock}>
                                <span className={styles.productName}>
                                  {displayProduct.name}
                                </span>
                                <span className={styles.category}>
                                  {displayProduct.category}
                                </span>
                              </div>
                            </div>

                            <div className={styles.detailsRow}>
                              <span className={styles.vendor}>
                                {displayProduct.vendor}
                              </span>
                              <span className={styles.article}>
                                {displayProduct.article}
                              </span>
                              <span
                                className={`${styles.rating} ${displayProduct.rating < 4.0 ? styles.ratingLow : ""}`}
                              >
                                {displayProduct.rating.toFixed(1)}/5
                              </span>
                              <span className={styles.price}>
                                {Math.floor(displayProduct.price)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                                <span className={styles.priceCents}>
                                  ,
                                  {(displayProduct.price % 1)
                                    .toFixed(2)
                                    .substring(2)}
                                </span>
                              </span>

                              <div className={styles.stockCell}>
                                <StockIndicator stock={displayProduct.stock} />
                              </div>

                              <div className={styles.rowActions}>
                                <button
                                  className={styles.addSmallBtn}
                                  onClick={() => handleAddToCart(product)}
                                >
                                  <Plus
                                    size={24}
                                    color="#FFFFFF"
                                    weight="bold"
                                  />
                                </button>
                                <OverflowMenu
                                  onDelete={() =>
                                    handleDelete(product.id, isLocal)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.footer}>
                    <span className={styles.showingText}>
                      Показано {(currentPage - 1) * itemsPerPage + 1}-
                      {Math.min(currentPage * itemsPerPage, data?.total || 0)}{" "}
                      из {data?.total || 0}
                    </span>

                    <div className={styles.pagination}>
                      <button
                        className={styles.paginationArrow}
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                      >
                        ←
                      </button>

                      <div className={styles.pageNumbers}>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                className={`${styles.pageNumber} ${currentPage === page ? styles.active : ""}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <button
                        className={styles.paginationArrow}
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
