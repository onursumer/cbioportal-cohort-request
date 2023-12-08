import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styles from './app.module.scss';
import 'bootstrap/dist/css/bootstrap.css';

import Home from './home/Home';
import RequestTracker from './request-tracker/RequestTracker';
import JobDetails from './job-details/JobDetails';

export function App() {
  return (
    <div className={styles.wrapper}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/tracker" element={<RequestTracker />}></Route>
          <Route path="/job/:id" element={<JobDetails />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
