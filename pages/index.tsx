import Head from 'next/head';
import styles from '../styles/Home.module.css';
import PluribusBackground from '../components/PluribusBackground';
import Typewriter from '../components/Typewriter';

const LANGUAGES = [
  'Javascript.',
  'Typescript.',
  'React.',
  'Node.js.',
  'Python.',
  'Go.',
  'I tell Claude to write code for me.',
  'console.log and pray.',
  'Stack Overflow... I mean, my brain.',
  'vibes.',
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
          <Typewriter prefix="I write code using " words={LANGUAGES} />
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
