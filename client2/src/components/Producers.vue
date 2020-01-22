<template>
    <v-data-table
            :headers="headers"
            :items="items"
            :server-items-length="total"
            :options.sync="options"
            :loading="loading"
            loading-text="Loading... Please wait"
    >
        <template v-slot:body.prepend>
            <tr>
                <td>
                    <v-text-field v-model="options.filters.producerName" label="Продюсер"/>
                </td>
                <td/>
            </tr>
        </template>
    </v-data-table>
</template>

<script>
    export default {
        name: "Producers",
        data() {
            return {
                loading: false,
                total: 3,
                options: {
                    filters: {
                        producerName: ''
                    }
                },
                producerName: '',
                headers: [
                    {
                        text: 'Наименование',
                        value: 'name',
                        sortable: true,
                        filterable: true,
                    },
                    {
                        text: 'Сайт',
                        value: 'site'
                    },
                ],
                items: [
                    { name: 'MAX', site: 'www.max.com' },
                    { name: 'TI', site: 'www.ti.com' },
                    { name: 'ОРЕЛ', site: 'www.orel.com' }
                ]
            }
        },
        watch: {
            options: {
                handler() {

                },
                deep: true
            }
        }
    }
</script>

<style scoped>

</style>