const Vue = require('vue');
const VueCompositionApi = require('@vue/composition-api');

Vue.use(VueCompositionApi.default);

const { ref, getCurrentInstance } = VueCompositionApi;

const myComputed = (() => {
  let Watcher;
  let Dep;
  let RefImpl;

  const init = () => {
    if (!Watcher) {
      const vm = new Vue({
        computed: {
          value() {
            return 0;
          },
        },
      });

      /* eslint-disable no-underscore-dangle */

      // to get Watcher class
      Watcher = vm._computedWatchers.value.constructor;
      // to get Dep class
      Dep = vm._data.__ob__.dep.constructor;

      /* eslint-enable no-underscore-dangle */

      // to get RefImpl class
      RefImpl = ref(0).constructor;

      vm.$destroy();
    }
  };

  return ((option) => {
    const vm = getCurrentInstance();

    let get;
    let set;
    if (typeof option === 'function') {
      get = option;
    } else {
      get = option.get;
      set = option.set;
    }

    init();

    let watcher;
    const computedGetter = () => {
      if (!watcher) {
        watcher = new Watcher(vm, get, noop, { lazy: true });
      }

      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }

      return watcher.value;
    };

    return Object.seal(new RefImpl({
      get: computedGetter,
      set: (v) => {
        if (!set) {
          console.warn('Computed property was assigned to but it has no setter');
          return;
        }
        set(v);
      },
    }));
  });
})();

new Vue({
  setup() {
    Array.from({ length: 10000 }, () => myComputed(() => 1));
  },
});

console.log(`heapUsed: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
