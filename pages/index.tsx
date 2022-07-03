import Head from 'next/head';
import Script from 'next/script';
import styles from '../styles/Home.module.css';
import { useEffect, useRef } from 'react';

export default function Home() {
  return (
    <div className={styles.container} id="main-container">
      <Head>
        <title>Personal website of Vicente Jr Yuchitcho (chitchu)</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js" />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof VANTA !== 'undefined') {
            VANTA.DOTS({
              el: '#main-container',
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: 1.0,
              scaleMobile: 1.0,
              color: 0xcb07e3,
              color2: 0xff6f00,
              backgroundColor: 0xffffff,
              size: 1.6,
              spacing: 20.0,
            });
          }
        }}
      />
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
