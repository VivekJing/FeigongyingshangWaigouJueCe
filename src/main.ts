import './assets/base.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import emitter from './emitter';
import { EventNames } from './emitter';
import { useNavigate } from './hooks/useNavigate';

const { showToast } = useNavigate();

emitter.on(EventNames.API_ERROR, (err) => {
  showToast(err, 'error');
});

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
