const Vue = require('vue');
const VueCompositionApi = require('@vue/composition-api');

Vue.use(VueCompositionApi.default);

const { ref, getCurrentInstance } = VueCompositionApi;

let vueInternalClasses;

const getInternalClasses = () => {
  if (!vueInternalClasses) {
    const vm = new Vue({
      computed: {
        value() {
          return 0
        },
      },
    });

    // to get Watcher class
    const Watcher = vm._computedWatchers.value.constructor
    // to get Dep class
    const Dep = vm._data.__ob__.dep.constructor
    // to get RefImpl class
    const RefImpl = ref(0).constructor;

    vueInternalClasses = {
      Watcher,
      Dep,
      RefImpl,
    };

    vm.$destroy();
  }

  return vueInternalClasses;
}

function noopFn() {
}

function myComputed(options) {
  const vm = getCurrentInstance()
  let get, set;
  if (typeof options === 'function') {
    get = options
  } else {
    get = options.get
    set = options.set
  }

  let computedSetter
  let computedGetter

  const { Watcher, Dep, RefImpl } = getInternalClasses()

  if (vm) {
    let watcher
    computedGetter = () => {
      if (!watcher) {
        watcher = new Watcher(vm, get, noopFn, { lazy: true })
      }
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }

    computedSetter = (v) => {
      if (set) {
        set(v)
      }
    }
  } else {
    // fallback
    const computedHost = new Vue({
      computed: {
        $$state: {
          get,
          set,
        },
      },
    })

    computedGetter = () => computedHost.$$state
    computedSetter = () => {
      computedHost.$$state = v
    }
  }

  return Object.seal(new RefImpl(
    {
      get: computedGetter,
      set: computedSetter,
    },
  ));
}

new Vue({
  setup() {
    Array.from({ length: 10000 }, () => myComputed(() => 1));
  },
});

console.log(`heapUsed: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
