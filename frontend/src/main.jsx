import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { App } from './App';
import { AuthBootstrap } from './components/auth/AuthBootstrap';
import { store } from './redux/store';
import 'react-toastify/dist/ReactToastify.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthBootstrap>
          <App />
          <ToastContainer position="top-right" autoClose={5000} newestOnTop />
        </AuthBootstrap>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
