import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  // eslint-disable-next-line no-unused-vars
  Button, Container, Row, Col, Card, InputGroup, Form, Modal, Alert,
} from 'react-bootstrap';
import './css/bootstrap.min.css';
import './css/index.css';
import { getAppVars } from './utils.jsx';
import SuccessApp from './components/SuccessApp.jsx';

const initApp = () => {
  const newListURL = getAppVars().new_list_url;
  ReactDOM.render(<SuccessApp newListUrl={newListURL} />, document.getElementById('react-container'));
};

window.addEventListener('DOMContentLoaded', initApp);
