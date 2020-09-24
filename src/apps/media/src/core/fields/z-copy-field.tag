<z-copy-field>
    <label class="field">
        <button class="btn copy" type="button" data-clipboard-target="#copy" title="Click to copy">
            <span if="{opts.label}">{opts.label}</span>
            <img class="clippy" src="/ui/images/icons/clippy.svg" width="13" alt="Copy to clipboard">
        </button>
        <input id="copy" type="text" value="{opts.value}" />
    </label>
    <script type="es6">
        let clipboard = new ClipboardJS('.btn.copy')
        clipboard.on('success', (e) => {
            e.trigger.setAttribute('aria-label', 'Copied!')
        })
    </script>
    <style scoped>
    :scope .field {
        display: flex;
    }
    :scope .field button {
        border: none;
        background-color: #D9DBDC;
        color: rgb(91, 102, 125);
        cursor: pointer;
        line-height: 3em;
        margin: 0;
        padding: 0 1em;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    :scope .field button .clippy {
        margin-left: 0.5rem;
    }
    :scope .field input {
        border: none;
        flex: 1;
        margin: 0;
        padding: 0 1em;
        color: #252D38;
    }
    :scope .field input:disabled {
        color: #585858;
        background-color: #eee;
    }
    </style>
</z-copy-field>
