import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.flamesTitle}>
        <span>F</span><span>L</span><span>A</span><span>M</span><span>E</span><span>S</span>
      </div>
      <p className={styles.tagline}>Discover your relationship destiny</p>
    </header>
  );
}
