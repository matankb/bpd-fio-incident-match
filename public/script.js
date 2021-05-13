const app = new Vue({
  el: '#app',
  data: {
    loading: false,
    matches: [],
    page: 0,
  },
  created() {
    this.getMatches();
  },
  methods: {
    async getMatches() {
      this.loading = true;
      const matches = await fetch('../same-street-matches.json').then(r => r.json());
      this.loading = false;
      this.matches = matches;
    },
    next() {
      this.page++
      this.scrollToTop();
    },
    prev() {
      this.page--;
      this.scrollToTop();
    },
    scrollToTop() {
      document.querySelector('.matches').scrollTop = 0
    }
  },
  computed: {
    pageMatches() {
      return this.matches.slice(10 * this.page, 10 * (this.page + 1))
    },
    maxPage() {
      return Math.floor(this.matches.length / 10);
    }
  }
})