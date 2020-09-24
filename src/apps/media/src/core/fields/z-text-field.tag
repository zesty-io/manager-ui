<z-text-field>
    <label class="field">
        <span>{opts.label}</span>
        <input type="text"
            value="{opts.value}"
            placeholder="{opts.placeholder}"
            onkeyup="{opts.handler}" />
    </label>
    <script type="es6">
        this.on('mount', () => {
            if (opts.disabled) {
                this.root.querySelector('input').setAttribute('disabled', true)
            }
        })
    </script>
    <style scoped>
    :scope {
        display: block;
        margin: 1em 0;
    }
    :scope .field {
        display: flex;
    }
    :scope .field input {
        border: none;
        flex: 1;
        margin: 0;
        padding: 0 1em;
        color: #252D38;
    }
    :scope .field input:disabled {
        opacity: 0.5;
    }
    :scope .field span {
        border: none;
        background-color: #D9DBDC;
        line-height: 3em;
        margin: 0;
        padding: 0 1em;
        font-weight: 600;
    }
    </style>
</z-text-field>
