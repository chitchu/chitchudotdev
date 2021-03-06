import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Personal website of Vicente Jr Yuchitcho (chitchu)</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://chitchu.dev">chitchu.dev!</a>
        </h1>
        <p className={styles.description}>I write code using Javascript.</p>
      </main>
      <footer className={styles.footer}>
        <a href="https://github.com/chitchu">
          <img src="/GitHub-Mark-32px.png" alt="github icon" />
        </a>
      </footer>
    </div>
  );
}
