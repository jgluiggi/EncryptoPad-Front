<template>
  <section class="section is-small">
    <nav class="navbar is-fixed-top is-primary has-shadow" role="navigation" aria-label="main navigation">
      <section class="container">

        <div class="navbar-menu is-active has-text-weight-bold">
          <div class="navbar-start">
            <RouterLink to="/login" class="navbar-item"> Login </RouterLink>

            <RouterLink to="/dashboard" class="navbar-item"> Your Dashboard </RouterLink>

            <RouterLink to="/organization" class="navbar-item"> Your Organization </RouterLink>
          </div>

          <div class="navbar-end">
            <RouterLink to="/register" class="navbar-item"> Register </RouterLink>
          </div>

        </div>
      </section>
    </nav>
  </section>
</template>

<script>
</script>
