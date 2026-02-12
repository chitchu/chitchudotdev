import Head from 'next/head';
import styles from '../styles/Home.module.css';
import PluribusBackground from '../components/PluribusBackground';
import Typewriter from '../components/Typewriter';

const PHRASES = [
  'I write code using Javascript.',
  'I write code using Typescript.',
  'I write code using React.',
  'I write code using Node.js.',
  'I write code using Python.',
  'I write code using Go.',
  'I tell Claude to write code for me.',
  'I write code using console.log and pray.',
  'I write code using Stack Overflow... I mean, my brain.',
  'I write code using vibes.',
];

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Personal website of Vicente Jr Yuchitcho (chitchu)</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PluribusBackground />
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://chitchu.dev">chitchu.dev!</a>
        </h1>
        <p className={styles.description}>
          <Typewriter prefix="" words={PHRASES} />
        </p>
      </main>
      <footer className={styles.footer}>
        <a href="https://github.com/chitchu">
          <img src="/GitHub-Mark-32px.png" alt="github icon" />
        </a>
      </footer>
    </div>
  );
}
