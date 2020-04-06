<active-uploads>
    <section class="active-uploads" show="{opts.store.uploads.length}">
        <span class="title">Active Uploads</span>
        <span class="badge">{opts.store.uploads.length}</span>
    </section>
    <script type="es6">
        // console.log('active-uploads', this)
    </script>
    <style scoped>
    :scope .active-uploads {
        font-weight: 600;
        display: flex;
        <!--  line-height: 1.6rem;  -->
        height: 4rem;
        align-items: center;
        justify-content: center;
    }
    :scope .title {
        flex: 1;
        padding-left: 1rem;
    }
    :scope .badge {
        background: #252D38;
        padding: 1.2rem 1rem;
        color: #FFF;
    }
    </style>
</active-uploads>
