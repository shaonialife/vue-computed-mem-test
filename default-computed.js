const Vue = require('vue');
const VueCompositionApi = require('@vue/composition-api');

Vue.use(VueCompositionApi.default);

const { computed } = VueCompositionApi;

console.time('timeUsed')
new Vue({
  setup() {
    Array.from({ length: 10000 }, () => computed(() => 1));
  },
});

console.log(`heapUsed: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
console.timeEnd('timeUsed')
