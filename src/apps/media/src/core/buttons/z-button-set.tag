<z-button-set>
    <yield></yield>
    <style scoped>
        :scope {
            display: flex;
        }
        :scope button,
        :scope z-button button {
            border-right: 0;
            border-radius: 0;
            margin: 0;
            padding: 0.5rem;
        }
    </style>
</z-button-set>
