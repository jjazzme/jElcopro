<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-spacer />
      <v-toolbar-title>Test App</v-toolbar-title>
      <v-spacer />
      <v-icon>mdi-open-in-new</v-icon>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" absolute bottom temporary>
      <v-list>
        <div v-for="menu in menus" :key="menu.text">
          <v-list-item v-if="menu.to" :to="menu.to" link>
            <v-list-item-content>
              <v-list-item-title>{{ menu.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-group v-else no-action value="true">
            <template v-slot:activator>
              <v-list-item-title>{{ menu.text }}</v-list-item-title>
            </template>
            <v-list-item v-for="subMenu in menu.sub" :to="subMenu.to" :key="subMenu.text" link>
              <v-list-item-content>
                <v-list-item-title>{{ subMenu.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-content>

        <v-slide-group>
          <v-slide-item>
            <document-card document-type="invoice" :document-id="user.cards.invoice"></document-card>
          </v-slide-item>
          <v-slide-item v-for="order in user.cards.orders" :key="order">
            <document-card document-type="order" :document-id="order"></document-card>
          </v-slide-item>
          <v-slide-item>
            <document-card document-type="order"></document-card>
          </v-slide-item>
        </v-slide-group>

      <v-breadcrumbs :items="breadcrumbs" large/>
      <v-card class="my-2 mx-2">

          <router-view />

      </v-card>
    </v-content>
    <v-snackbar
            :value="snackbar"
            :color="snackbarColor"
            :multi-line="snackbarMulti"
            :timeout="snackbarTimeout"
    >
      {{ snackbarText }}
      <v-btn
              dark
              text
              @click="$store.commit('SNACKBAR/SNACKBAR', false)"
      >
        Закрыть
      </v-btn>
    </v-snackbar>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-app>
</template>
<script>
  import { mapGetters } from 'vuex';
  import DocumentCard from '@/components/DocumentCard';
  export default {
    name: 'App',
    components: { DocumentCard },
    created() {
        Promise.all([
          this.$store.dispatch('USER/GET'),
          this.$store.dispatch('DOCUMENTTYPES/GET')
        ]).then(() => this.loading = false)
    },
    data() {
      return {
        loading: true,
        drawer: false,
        menus: [
          { text: 'ДОМОЙ', to: { name: 'home' } },
          { text: 'ПРОИЗВОДИТЕЛИ', to: { name: 'producers'} },
          { text: 'ДОКУМЕНЫ', sub: [
              { text: 'ЗАКАЗ', to: { name: 'documents', params: { type: 'order' } } },
              { text: 'СЧЕТ', to: { name: 'documents', params: { type: 'invoice' } } }
            ]
          },
          { text: 'О НАС', to: { name: 'about' } },
        ]
      }
    },
    computed: {
      ...mapGetters({
        snackbar: 'SNACKBAR/SNACKBAR',
        snackbarText: 'SNACKBAR/TEXT',
        snackbarColor: 'SNACKBAR/COLOR',
        snackbarTimeout: 'SNACKBAR/TIMEOUT',
        snackbarMulti: 'SNACKBAR/MULTI',
        breadcrumbs: 'BREADCRUMBS/ITEMS',
        user: 'USER/GET'
      })
    }
  }
</script>
