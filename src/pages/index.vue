<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  // https://github.com/nuxt/nuxt.js/issues/1843
  fetch({ redirect }) {
    redirect(302, '/swap')
  },
})
</script>
