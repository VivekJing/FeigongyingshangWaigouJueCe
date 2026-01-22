import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/OutsourcingDecisions',
      name: 'OutsourcingDecisions',
      component: () =>
        import('@/views/outsourcingApplications/OutsourcingDecisions.vue'),
    }
  ],
});

export default router;
