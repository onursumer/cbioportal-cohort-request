import { Route, Routes } from 'react-router-dom';

import styles from './app.module.scss';
import 'bootstrap/dist/css/bootstrap.css';

import Home from './home/Home';
import RequestTracker from './request-tracker/RequestTracker';

export function App() {
  return (
    <div className={styles.wrapper}>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/tracker" element={<RequestTracker />}></Route>
      </Routes>
    </div>
  );
}

export default App;
