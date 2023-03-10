import styles from './app.module.scss';
import 'bootstrap/dist/css/bootstrap.css';

import Home from "./home/Home";

export function App() {
  return (
    <div className={styles.wrapper}>
      <Home />
    </div>
  );
}

export default App;
