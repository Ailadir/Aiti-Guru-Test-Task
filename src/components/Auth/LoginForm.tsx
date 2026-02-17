import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { EnvelopeSimple, Lock, EyeSlash, Eye } from "@phosphor-icons/react";
import { useAuthStore } from "../../store/useAuthStore";
import styles from "./LoginForm.module.scss";

export const LoginForm = () => {
  const [email, setEmail] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);

      if (rememberMe) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", password);
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
      }

      navigate("/products");
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Неверный логин или пароль");
      } else {
        setError("Неверный логин или пароль");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.innerCard}>
          <div className={styles.logo}>
            <img src="/logoAtti.svg" alt="Logo" width={35} height={34} />
          </div>

          <div className={styles.text}>
            <h1 className={styles.title}>Авторизация</h1>
            <p className={styles.subtitle}>Пожалуйста, авторизируйтесь</p>
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formFields}>
              <div className={styles.field}>
                <label className={styles.label}>Электронная почта</label>
                <div className={styles.input}>
                  <EnvelopeSimple size={24} color="#C9C9C9" />
                  <input
                    type="text"
                    placeholder="emilys"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Пароль</label>
                <div className={styles.input}>
                  <Lock size={24} color="#EDEDED" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="•••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye size={24} color="#EDEDED" />
                    ) : (
                      <EyeSlash size={24} color="#EDEDED" />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.keep}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Сохранить пароль</label>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.button}
                disabled={isLoading}
              >
                {isLoading ? "Загрузка..." : "Войти"}
              </button>

              <div className={styles.divider}>
                <span className={styles.line} />
                <span className={styles.orText}>или</span>
                <span className={styles.line} />
              </div>
            </div>
          </form>

          <p className={styles.footer}>
            Нет аккаунта? <span className={styles.link}>Создать</span>
          </p>
        </div>
      </div>
    </div>
  );
};
