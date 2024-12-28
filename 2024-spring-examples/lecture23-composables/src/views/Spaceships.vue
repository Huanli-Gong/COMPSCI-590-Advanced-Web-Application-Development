<template>
	<div class="mx-3 my-3">
		<h1>Spaceships</h1>
		<b-table :items="result?.ships" sticky-header="calc(100vh - 10rem)" />
	</div>
</template>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const { result } = useQuery(gql`
	query Ships {
		ships {
			id
			model
			name
			type
			status
		}
	}
`)
</script>