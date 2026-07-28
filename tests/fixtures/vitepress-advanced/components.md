---
title: Components
---

# Component demo

<Badge type="info" text="beta" />

<DemoBadge text="custom" />

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

Counter: {{ count }}

::: danger
Vue-specific content above requires manual porting.
:::
