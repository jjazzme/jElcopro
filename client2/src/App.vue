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
        <v-list-item :to="{ name: 'home' }">
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{ name: 'producers' }">
          <v-list-item-content>
            <v-list-item-title>Производители</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{ name: 'about' }">
          <v-list-item-content>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-content>
      <v-card class="my-2 mx-2">
        <keep-alive>
          <router-view />
        </keep-alive>
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
  </v-app>
</template>
<script>
  import { mapGetters } from 'vuex';
  export default {
    name: 'App',
    data() {
      return {
        drawer: false,
      }
    },
    computed: {
      ...mapGetters({
        snackbar: 'SNACKBAR/SNACKBAR',
        snackbarText: 'SNACKBAR/TEXT',
        snackbarColor: 'SNACKBAR/COLOR',
        snackbarTimeout: 'SNACKBAR/TIMEOUT',
        snackbarMulti: 'SNACKBAR/MULTI',
      })
    }
  }
</script>
